package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/harbinger-ai/harbinger/internal/agent"
	"github.com/harbinger-ai/harbinger/internal/api"
	"github.com/harbinger-ai/harbinger/internal/audit"
	"github.com/harbinger-ai/harbinger/internal/auth"
	"github.com/harbinger-ai/harbinger/internal/config"
	"github.com/harbinger-ai/harbinger/internal/credits"
	dockerOrch "github.com/harbinger-ai/harbinger/internal/docker"
	"github.com/harbinger-ai/harbinger/internal/models"
	"github.com/harbinger-ai/harbinger/internal/scan"
)

func main() {
	cfg := config.Load()

	log.SetFlags(log.Ldate | log.Ltime | log.Lshortfile)
	log.Println("harbinger: starting server...")

	// Audit logger
	auditLogger, err := audit.NewLogger(cfg.AuditLogPath)
	if err != nil {
		log.Printf("warning: audit logger failed: %v", err)
	} else {
		defer auditLogger.Close()
	}

	// Docker orchestrator
	orch, err := dockerOrch.NewOrchestrator(cfg.DockerNetwork, cfg.MaxContainers)
	if err != nil {
		log.Printf("warning: docker not available: %v (scans will fail)", err)
	} else {
		defer func() {
			log.Println("harbinger: cleaning up containers...")
			orch.CleanupAll(context.Background())
			orch.Close()
		}()
	}

	// JWT auth
	jwtAuth := auth.NewJWTAuth(cfg.JWTSecret, cfg.JWTExpiry)

	// Credits manager
	creditsMgr := credits.NewManager(cfg.DefaultCredits)

	// Stripe integration
	stripeSvc := credits.NewStripeIntegration(
		cfg.StripeKey, cfg.StripeWebhook, creditsMgr,
		cfg.AllowedOrigins[0],
	)

	// WebSocket hub
	wsHub := api.NewWSHub()

	// Agent executor
	executor := agent.NewExecutor(orch)

	// Scanner with WebSocket broadcaster
	scanner := scan.NewScanner(executor, func(scanID string, event models.ScanEvent) {
		wsHub.BroadcastToScan(scanID, event)

		// Audit log scan events
		if auditLogger != nil && (event.Type == "scan_start" || event.Type == "scan_complete") {
			auditLogger.Log("system", event.Type, scanID, "", map[string]interface{}{
				"data": event.Data,
			})
		}
	})

	// API handlers
	handlers := api.NewHandlers(jwtAuth, scanner, creditsMgr, stripeSvc)

	// Router
	router := api.NewRouter(handlers, wsHub, jwtAuth, stripeSvc, cfg.AllowedOrigins, cfg.RateLimitRPM)

	// HTTP server
	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 60 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	// Graceful shutdown
	done := make(chan os.Signal, 1)
	signal.Notify(done, os.Interrupt, syscall.SIGTERM)

	go func() {
		log.Printf("harbinger: API server listening on :%s", cfg.Port)
		log.Printf("harbinger: WebSocket available at ws://localhost:%s/api/ws", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	<-done
	log.Println("harbinger: shutting down...")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("shutdown error: %v", err)
	}

	log.Println("harbinger: stopped")
}
