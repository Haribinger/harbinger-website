package api

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"net/mail"
	"sync"
	"time"
	"unicode"

	"github.com/harbinger-ai/harbinger/internal/agent"
	"github.com/harbinger-ai/harbinger/internal/auth"
	"github.com/harbinger-ai/harbinger/internal/credits"
	"github.com/harbinger-ai/harbinger/internal/models"
	scanpkg "github.com/harbinger-ai/harbinger/internal/scan"
	"github.com/harbinger-ai/harbinger/internal/validation"
)

// maxBodyBytes is the maximum number of bytes accepted in a request body to
// prevent memory exhaustion from oversized payloads.
const maxBodyBytes = 1 << 16 // 64 KiB

type Handlers struct {
	jwtAuth *auth.JWTAuth
	scanner *scanpkg.Scanner
	credits *credits.Manager
	stripe  *credits.StripeIntegration

	// In-memory user store (to be replaced with database)
	usersMu sync.RWMutex
	users   map[string]*models.User // keyed by email
}

func NewHandlers(jwtAuth *auth.JWTAuth, scanner *scanpkg.Scanner, creditsMgr *credits.Manager, stripeSvc *credits.StripeIntegration) *Handlers {
	return &Handlers{
		jwtAuth: jwtAuth,
		scanner: scanner,
		credits: creditsMgr,
		stripe:  stripeSvc,
		users:   make(map[string]*models.User),
	}
}

// ── Auth ──

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type signupRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name"`
}

type authResponse struct {
	Token string       `json:"token"`
	User  *models.User `json:"user"`
}

// generateUserID produces a cryptographically random user ID.
func generateUserID() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return "user-" + hex.EncodeToString(b), nil
}

// validatePasswordStrength checks that a password is at least 8 characters
// and contains both a letter and a digit.
func validatePasswordStrength(password string) bool {
	if len(password) < 8 {
		return false
	}
	var hasLetter, hasDigit bool
	for _, c := range password {
		if unicode.IsLetter(c) {
			hasLetter = true
		}
		if unicode.IsDigit(c) {
			hasDigit = true
		}
		if hasLetter && hasDigit {
			return true
		}
	}
	return hasLetter && hasDigit
}

// Login authenticates a user with email and password and returns a JWT token.
func (h *Handlers) Login(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := json.NewDecoder(io.LimitReader(r.Body, maxBodyBytes)).Decode(&req); err != nil {
		jsonError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	// Validate email format
	if _, err := mail.ParseAddress(req.Email); err != nil {
		jsonError(w, "invalid email format", http.StatusBadRequest)
		return
	}

	if req.Password == "" {
		jsonError(w, "password is required", http.StatusBadRequest)
		return
	}

	// Look up user by email
	h.usersMu.RLock()
	user, exists := h.users[req.Email]
	h.usersMu.RUnlock()

	if !exists {
		jsonError(w, "invalid email or password", http.StatusUnauthorized)
		return
	}

	// Verify password
	if !auth.CheckPassword(req.Password, user.PasswordHash) {
		jsonError(w, "invalid email or password", http.StatusUnauthorized)
		return
	}

	token, err := h.jwtAuth.GenerateToken(user.ID, user.Email, user.Plan)
	if err != nil {
		jsonError(w, "failed to generate token", http.StatusInternalServerError)
		return
	}

	h.credits.InitUser(user.ID)

	jsonResponse(w, authResponse{
		Token: token,
		User: &models.User{
			ID:      user.ID,
			Email:   user.Email,
			Credits: h.credits.GetBalance(user.ID),
			Plan:    user.Plan,
		},
	})
}

// Signup creates a new user account and returns a JWT token.
func (h *Handlers) Signup(w http.ResponseWriter, r *http.Request) {
	var req signupRequest
	if err := json.NewDecoder(io.LimitReader(r.Body, maxBodyBytes)).Decode(&req); err != nil {
		jsonError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.Email == "" || req.Password == "" {
		jsonError(w, "email and password required", http.StatusBadRequest)
		return
	}

	// Validate email format
	if _, err := mail.ParseAddress(req.Email); err != nil {
		jsonError(w, "invalid email format", http.StatusBadRequest)
		return
	}

	// Validate password strength
	if !validatePasswordStrength(req.Password) {
		jsonError(w, "password must be at least 8 characters and contain both a letter and a digit", http.StatusBadRequest)
		return
	}

	// Check if user already exists
	h.usersMu.RLock()
	_, exists := h.users[req.Email]
	h.usersMu.RUnlock()
	if exists {
		jsonError(w, "email already registered", http.StatusConflict)
		return
	}

	hashedPw, err := auth.HashPassword(req.Password)
	if err != nil {
		jsonError(w, "internal error", http.StatusInternalServerError)
		return
	}

	apiKey, err := auth.GenerateAPIKey()
	if err != nil {
		jsonError(w, "failed to generate API key", http.StatusInternalServerError)
		return
	}

	userID, err := generateUserID()
	if err != nil {
		jsonError(w, "failed to generate user ID", http.StatusInternalServerError)
		return
	}

	user := &models.User{
		ID:           userID,
		Email:        req.Email,
		PasswordHash: hashedPw,
		APIKey:       apiKey,
		Credits:      50,
		Plan:         "free",
		CreatedAt:    time.Now(),
	}

	// Store user
	h.usersMu.Lock()
	h.users[req.Email] = user
	h.usersMu.Unlock()

	h.credits.InitUser(user.ID)

	token, err := h.jwtAuth.GenerateToken(user.ID, user.Email, user.Plan)
	if err != nil {
		jsonError(w, "failed to generate token", http.StatusInternalServerError)
		return
	}

	jsonResponse(w, authResponse{Token: token, User: user})
}

// ── Scans ──

type scanRequest struct {
	Target   string `json:"target"`
	ScanType string `json:"scan_type"`
}

// CreateScan initiates a new security scan for the authenticated user.
func (h *Handlers) CreateScan(w http.ResponseWriter, r *http.Request) {
	userID := GetUserID(r.Context())

	var req scanRequest
	if err := json.NewDecoder(io.LimitReader(r.Body, maxBodyBytes)).Decode(&req); err != nil {
		jsonError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	// Validate domain
	if err := validation.ValidateDomain(req.Target); err != nil {
		jsonError(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Validate scan type
	if err := validation.ValidateScanType(req.ScanType); err != nil {
		jsonError(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Atomically check and deduct credits
	cost := models.ScanCreditCosts[req.ScanType]
	if err := h.credits.SpendIfAffordable(userID, cost); err != nil {
		jsonError(w, err.Error(), http.StatusPaymentRequired)
		return
	}

	// Start scan
	scan, err := h.scanner.StartScan(r.Context(), userID, req.Target, req.ScanType)
	if err != nil {
		// Refund credits on failure
		h.credits.AddCredits(userID, cost)
		jsonError(w, "failed to start scan: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	jsonResponse(w, scan)
}

// CancelScan stops a running scan identified by path parameter {id}.
func (h *Handlers) CancelScan(w http.ResponseWriter, r *http.Request) {
	scanID := r.PathValue("id")
	if scanID == "" {
		jsonError(w, "scan ID required", http.StatusBadRequest)
		return
	}

	// Verify ownership before allowing cancel
	active, ok := h.scanner.GetActiveScan(scanID)
	if !ok {
		jsonError(w, "scan not found", http.StatusNotFound)
		return
	}

	userID := GetUserID(r.Context())
	if active.Scan.UserID != userID {
		jsonError(w, "forbidden: you do not own this scan", http.StatusForbidden)
		return
	}

	if err := h.scanner.CancelScan(scanID); err != nil {
		jsonError(w, err.Error(), http.StatusNotFound)
		return
	}

	jsonResponse(w, map[string]string{"status": "cancelled"})
}

// GetScan returns the current state of an active scan.
func (h *Handlers) GetScan(w http.ResponseWriter, r *http.Request) {
	scanID := r.PathValue("id")
	active, ok := h.scanner.GetActiveScan(scanID)
	if !ok {
		jsonError(w, "scan not found", http.StatusNotFound)
		return
	}

	// Verify ownership
	userID := GetUserID(r.Context())
	if active.Scan.UserID != userID {
		jsonError(w, "forbidden: you do not own this scan", http.StatusForbidden)
		return
	}

	jsonResponse(w, active.Scan)
}

// ListScans returns all currently active scans for the authenticated user.
func (h *Handlers) ListScans(w http.ResponseWriter, r *http.Request) {
	userID := GetUserID(r.Context())
	scans := h.scanner.ListActiveScansForUser(userID)
	jsonResponse(w, scans)
}

// ── Credits ──

// GetCredits returns the authenticated user's current credit balance and
// available credit packs for purchase.
func (h *Handlers) GetCredits(w http.ResponseWriter, r *http.Request) {
	userID := GetUserID(r.Context())
	balance := h.credits.GetBalance(userID)
	jsonResponse(w, map[string]interface{}{
		"credits": balance,
		"packs":   credits.CreditPacks,
	})
}

// PurchaseCredits creates a Stripe checkout session for purchasing credit packs.
func (h *Handlers) PurchaseCredits(w http.ResponseWriter, r *http.Request) {
	userID := GetUserID(r.Context())

	var req struct {
		PackID string `json:"pack_id"`
	}
	if err := json.NewDecoder(io.LimitReader(r.Body, maxBodyBytes)).Decode(&req); err != nil {
		jsonError(w, "invalid request", http.StatusBadRequest)
		return
	}

	url, err := h.stripe.CreateCheckoutSession(userID, req.PackID)
	if err != nil {
		jsonError(w, err.Error(), http.StatusBadRequest)
		return
	}

	jsonResponse(w, map[string]string{"checkout_url": url})
}

// ── Agents ──

// ListAgents returns the registry of all available AI security agents.
func (h *Handlers) ListAgents(w http.ResponseWriter, r *http.Request) {
	jsonResponse(w, agent.AgentRegistry)
}

// ── Health ──

// Health returns a JSON health-check payload indicating API and service status.
func (h *Handlers) Health(w http.ResponseWriter, r *http.Request) {
	jsonResponse(w, map[string]interface{}{
		"status":    "healthy",
		"version":   "1.0.0",
		"timestamp": time.Now().UTC(),
		"services": map[string]string{
			"api":    "up",
			"docker": "up",
			"ws":     "up",
		},
	})
}

// ── Helpers ──

func jsonResponse(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(data); err != nil {
		log.Printf("jsonResponse: failed to encode response: %v", err)
	}
}

func jsonError(w http.ResponseWriter, message string, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(map[string]string{"error": message}); err != nil {
		log.Printf("jsonError: failed to encode error response: %v", err)
	}
}
