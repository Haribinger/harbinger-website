package api

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/httprate"
	"time"

	"github.com/harbinger-ai/harbinger/internal/auth"
	"github.com/harbinger-ai/harbinger/internal/credits"
)

func NewRouter(
	handlers *Handlers,
	wsHub *WSHub,
	jwtAuth *auth.JWTAuth,
	stripeSvc *credits.StripeIntegration,
	allowedOrigins []string,
	rateLimitRPM int,
) http.Handler {
	r := chi.NewRouter()

	// Global middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RealIP)
	r.Use(middleware.RequestID)
	r.Use(middleware.Compress(5))
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-API-Key"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Rate limiting
	r.Use(httprate.LimitByIP(rateLimitRPM, 1*time.Minute))

	// Health check (public)
	r.Get("/api/health", handlers.Health)

	// Auth routes (public)
	r.Post("/api/auth/login", handlers.Login)
	r.Post("/api/auth/signup", handlers.Signup)

	// Agents (public)
	r.Get("/api/agents", handlers.ListAgents)

	// Stripe webhook (public, verified by signature)
	r.Post("/api/webhooks/stripe", stripeSvc.HandleWebhook)

	// WebSocket (supports token auth via query param)
	r.Get("/api/ws", wsHub.HandleWS)

	// Protected routes
	r.Group(func(r chi.Router) {
		r.Use(AuthMiddleware(jwtAuth))

		// Scans
		r.Post("/api/scans", handlers.CreateScan)
		r.Get("/api/scans", handlers.ListScans)
		r.Get("/api/scans/{id}", handlers.GetScan)
		r.Post("/api/scans/{id}/cancel", handlers.CancelScan)

		// Credits
		r.Get("/api/credits", handlers.GetCredits)
		r.Post("/api/credits/purchase", handlers.PurchaseCredits)
	})

	return r
}
