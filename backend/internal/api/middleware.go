package api

import (
	"context"
	"net/http"
	"strings"

	"github.com/harbinger-ai/harbinger/internal/auth"
)

type contextKey string

const (
	ContextUserID contextKey = "user_id"
	ContextEmail  contextKey = "email"
	ContextPlan   contextKey = "plan"
)

func AuthMiddleware(jwtAuth *auth.JWTAuth) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			tokenStr := extractToken(r)
			if tokenStr == "" {
				http.Error(w, `{"error":"missing authorization token"}`, http.StatusUnauthorized)
				return
			}

			claims, err := jwtAuth.ValidateToken(tokenStr)
			if err != nil {
				http.Error(w, `{"error":"invalid or expired token"}`, http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), ContextUserID, claims.UserID)
			ctx = context.WithValue(ctx, ContextEmail, claims.Email)
			ctx = context.WithValue(ctx, ContextPlan, claims.Plan)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func APIKeyMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		apiKey := r.Header.Get("X-API-Key")
		if apiKey == "" {
			apiKey = r.URL.Query().Get("api_key")
		}

		if apiKey != "" && strings.HasPrefix(apiKey, "hbr_") {
			// TODO: look up API key in database
			ctx := context.WithValue(r.Context(), ContextUserID, "api-user")
			next.ServeHTTP(w, r.WithContext(ctx))
			return
		}

		next.ServeHTTP(w, r)
	})
}

func extractToken(r *http.Request) string {
	// Bearer token from Authorization header
	authHeader := r.Header.Get("Authorization")
	if strings.HasPrefix(authHeader, "Bearer ") {
		return strings.TrimPrefix(authHeader, "Bearer ")
	}

	// Query param fallback (for WebSocket)
	if token := r.URL.Query().Get("token"); token != "" {
		return token
	}

	return ""
}

func GetUserID(ctx context.Context) string {
	if v, ok := ctx.Value(ContextUserID).(string); ok {
		return v
	}
	return ""
}

func GetEmail(ctx context.Context) string {
	if v, ok := ctx.Value(ContextEmail).(string); ok {
		return v
	}
	return ""
}

func GetPlan(ctx context.Context) string {
	if v, ok := ctx.Value(ContextPlan).(string); ok {
		return v
	}
	return "free"
}

func GetUserPlan(ctx context.Context) string {
	return GetPlan(ctx)
}
