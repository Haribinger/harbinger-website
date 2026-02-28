package audit

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sync"
	"time"

	"github.com/harbinger-ai/harbinger/internal/models"
)

// Logger writes audit entries as JSONL to a file for compliance tracking.
type Logger struct {
	mu   sync.Mutex
	file *os.File
	enc  *json.Encoder
}

// NewLogger creates a new audit logger writing to the given file path.
// Directory is created with 0700 and the log file with 0600 for least-privilege.
func NewLogger(path string) (*Logger, error) {
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0700); err != nil {
		return nil, err
	}

	f, err := os.OpenFile(path, os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0600)
	if err != nil {
		return nil, err
	}

	return &Logger{
		file: f,
		enc:  json.NewEncoder(f),
	}, nil
}

// Log writes an audit entry with the given action, resource, and metadata.
func (l *Logger) Log(userID, action, resource, ip string, details map[string]interface{}) {
	id, err := generateID()
	if err != nil {
		log.Printf("audit: failed to generate entry ID: %v", err)
		return
	}

	entry := models.AuditEntry{
		ID:        id,
		UserID:    userID,
		Action:    action,
		Resource:  resource,
		Details:   details,
		IP:        ip,
		Timestamp: time.Now().UTC(),
	}

	l.mu.Lock()
	defer l.mu.Unlock()

	if err := l.enc.Encode(entry); err != nil {
		log.Printf("audit: failed to write entry: %v", err)
	}
}

// Close flushes and closes the audit log file.
func (l *Logger) Close() error {
	l.mu.Lock()
	defer l.mu.Unlock()
	return l.file.Close()
}

func generateID() (string, error) {
	b := make([]byte, 8)
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("rand.Read: %w", err)
	}
	return time.Now().Format("20060102150405") + "-" + hex.EncodeToString(b), nil
}
