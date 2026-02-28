package scan

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/harbinger-ai/harbinger/internal/agent"
	"github.com/harbinger-ai/harbinger/internal/models"
)

type EventBroadcaster func(scanID string, event models.ScanEvent)

type Scanner struct {
	executor    *agent.Executor
	mu          sync.RWMutex
	activeScans map[string]*ActiveScan
	broadcaster EventBroadcaster
}

type ActiveScan struct {
	Scan      *models.Scan
	Cancel    context.CancelFunc
	Findings  []*models.Finding
	Events    []models.ScanEvent
	StartedAt time.Time
}

func NewScanner(executor *agent.Executor, broadcaster EventBroadcaster) *Scanner {
	return &Scanner{
		executor:    executor,
		activeScans: make(map[string]*ActiveScan),
		broadcaster: broadcaster,
	}
}

func (s *Scanner) StartScan(ctx context.Context, userID, target, scanType string) (*models.Scan, error) {
	scanID := generateScanID()
	now := time.Now()

	scan := &models.Scan{
		ID:          scanID,
		UserID:      userID,
		Target:      target,
		ScanType:    scanType,
		Status:      "running",
		CreditsCost: models.ScanCreditCosts[scanType],
		StartedAt:   &now,
		CreatedAt:   now,
	}

	scanCtx, cancel := context.WithTimeout(ctx, 30*time.Minute)

	active := &ActiveScan{
		Scan:      scan,
		Cancel:    cancel,
		StartedAt: now,
	}

	s.mu.Lock()
	s.activeScans[scanID] = active
	s.mu.Unlock()

	// Run scan in background
	go s.executeScan(scanCtx, active)

	return scan, nil
}

func (s *Scanner) executeScan(ctx context.Context, active *ActiveScan) {
	defer active.Cancel()

	scan := active.Scan
	agentIDs := agent.GetAgentsForScanType(scan.ScanType)

	// Broadcast scan start
	s.broadcastEvent(scan.ID, models.ScanEvent{
		Type:   "scan_start",
		ScanID: scan.ID,
		Data: map[string]interface{}{
			"target":    scan.Target,
			"scan_type": scan.ScanType,
			"agents":    agentIDs,
		},
		Timestamp: time.Now(),
	})

	for _, agentID := range agentIDs {
		if ctx.Err() != nil {
			break
		}

		tools := agent.GetToolsForAgent(agentID, scan.ScanType)
		if len(tools) == 0 {
			continue
		}

		// Broadcast handoff
		s.broadcastEvent(scan.ID, models.ScanEvent{
			Type:    "handoff",
			ScanID:  scan.ID,
			AgentID: agentID,
			Data: map[string]interface{}{
				"agent": agentID,
				"tools": tools,
			},
			Timestamp: time.Now(),
		})

		err := s.executor.RunAgent(ctx, scan.ID, agentID, scan.Target, tools, func(event models.ScanEvent) {
			s.mu.Lock()
			active.Events = append(active.Events, event)
			s.mu.Unlock()
			s.broadcastEvent(scan.ID, event)
		})
		if err != nil {
			log.Printf("agent %s error: %v", agentID, err)
			s.broadcastEvent(scan.ID, models.ScanEvent{
				Type:    "agent_error",
				ScanID:  scan.ID,
				AgentID: agentID,
				Data:    map[string]string{"error": err.Error()},
				Timestamp: time.Now(),
			})
		}
	}

	// Complete scan
	now := time.Now()
	scan.FinishedAt = &now

	if ctx.Err() != nil {
		scan.Status = "cancelled"
	} else {
		scan.Status = "completed"
	}

	// Broadcast completion
	s.broadcastEvent(scan.ID, models.ScanEvent{
		Type:   "scan_complete",
		ScanID: scan.ID,
		Data: map[string]interface{}{
			"status":   scan.Status,
			"duration": time.Since(active.StartedAt).String(),
			"findings": len(active.Findings),
		},
		Timestamp: time.Now(),
	})

	s.mu.Lock()
	delete(s.activeScans, scan.ID)
	s.mu.Unlock()
}

func (s *Scanner) CancelScan(scanID string) error {
	s.mu.RLock()
	active, ok := s.activeScans[scanID]
	s.mu.RUnlock()

	if !ok {
		return fmt.Errorf("scan %s not found or already completed", scanID)
	}

	active.Cancel()
	active.Scan.Status = "cancelled"
	return nil
}

func (s *Scanner) GetActiveScan(scanID string) (*ActiveScan, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	active, ok := s.activeScans[scanID]
	return active, ok
}

func (s *Scanner) ListActiveScans() []*models.Scan {
	s.mu.RLock()
	defer s.mu.RUnlock()

	scans := make([]*models.Scan, 0, len(s.activeScans))
	for _, active := range s.activeScans {
		scans = append(scans, active.Scan)
	}
	return scans
}

func (s *Scanner) broadcastEvent(scanID string, event models.ScanEvent) {
	if s.broadcaster != nil {
		s.broadcaster(scanID, event)
	}
}

func generateScanID() string {
	b := make([]byte, 12)
	_, _ = rand.Read(b)
	return "scan_" + hex.EncodeToString(b)
}
