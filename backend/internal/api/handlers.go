package api

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/harbinger-ai/harbinger/internal/agent"
	"github.com/harbinger-ai/harbinger/internal/auth"
	"github.com/harbinger-ai/harbinger/internal/credits"
	"github.com/harbinger-ai/harbinger/internal/models"
	scanpkg "github.com/harbinger-ai/harbinger/internal/scan"
	"github.com/harbinger-ai/harbinger/internal/validation"
)

type Handlers struct {
	jwtAuth   *auth.JWTAuth
	scanner   *scanpkg.Scanner
	credits   *credits.Manager
	stripe    *credits.StripeIntegration
}

func NewHandlers(jwtAuth *auth.JWTAuth, scanner *scanpkg.Scanner, creditsMgr *credits.Manager, stripeSvc *credits.StripeIntegration) *Handlers {
	return &Handlers{
		jwtAuth: jwtAuth,
		scanner: scanner,
		credits: creditsMgr,
		stripe:  stripeSvc,
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

func (h *Handlers) Login(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	// TODO: look up user in database and verify password
	// For now, generate a token for demo purposes
	token, err := h.jwtAuth.GenerateToken("user-1", req.Email, "free")
	if err != nil {
		jsonError(w, "failed to generate token", http.StatusInternalServerError)
		return
	}

	h.credits.InitUser("user-1")

	jsonResponse(w, authResponse{
		Token: token,
		User: &models.User{
			ID:      "user-1",
			Email:   req.Email,
			Credits: h.credits.GetBalance("user-1"),
			Plan:    "free",
		},
	})
}

func (h *Handlers) Signup(w http.ResponseWriter, r *http.Request) {
	var req signupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.Email == "" || req.Password == "" {
		jsonError(w, "email and password required", http.StatusBadRequest)
		return
	}

	hashedPw, err := auth.HashPassword(req.Password)
	if err != nil {
		jsonError(w, "internal error", http.StatusInternalServerError)
		return
	}

	apiKey, _ := auth.GenerateAPIKey()

	// TODO: store user in database
	user := &models.User{
		ID:           "user-1",
		Email:        req.Email,
		PasswordHash: hashedPw,
		APIKey:       apiKey,
		Credits:      50,
		Plan:         "free",
		CreatedAt:    time.Now(),
	}

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

func (h *Handlers) CreateScan(w http.ResponseWriter, r *http.Request) {
	userID := GetUserID(r.Context())

	var req scanRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
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

	// Check credits
	cost := models.ScanCreditCosts[req.ScanType]
	if !h.credits.CanAfford(userID, cost) {
		jsonError(w, "insufficient credits", http.StatusPaymentRequired)
		return
	}

	// Deduct credits
	if err := h.credits.Spend(userID, cost); err != nil {
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

func (h *Handlers) CancelScan(w http.ResponseWriter, r *http.Request) {
	scanID := r.PathValue("id")
	if scanID == "" {
		jsonError(w, "scan ID required", http.StatusBadRequest)
		return
	}

	if err := h.scanner.CancelScan(scanID); err != nil {
		jsonError(w, err.Error(), http.StatusNotFound)
		return
	}

	jsonResponse(w, map[string]string{"status": "cancelled"})
}

func (h *Handlers) GetScan(w http.ResponseWriter, r *http.Request) {
	scanID := r.PathValue("id")
	active, ok := h.scanner.GetActiveScan(scanID)
	if !ok {
		jsonError(w, "scan not found", http.StatusNotFound)
		return
	}

	jsonResponse(w, active.Scan)
}

func (h *Handlers) ListScans(w http.ResponseWriter, r *http.Request) {
	scans := h.scanner.ListActiveScans()
	jsonResponse(w, scans)
}

// ── Credits ──

func (h *Handlers) GetCredits(w http.ResponseWriter, r *http.Request) {
	userID := GetUserID(r.Context())
	balance := h.credits.GetBalance(userID)
	jsonResponse(w, map[string]interface{}{
		"credits": balance,
		"packs":   credits.CreditPacks,
	})
}

func (h *Handlers) PurchaseCredits(w http.ResponseWriter, r *http.Request) {
	userID := GetUserID(r.Context())

	var req struct {
		PackID string `json:"pack_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
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

func (h *Handlers) ListAgents(w http.ResponseWriter, r *http.Request) {
	jsonResponse(w, agent.AgentRegistry)
}

// ── Health ──

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
	json.NewEncoder(w).Encode(data)
}

func jsonError(w http.ResponseWriter, message string, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"error": message})
}
