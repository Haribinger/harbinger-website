package api

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/harbinger-ai/harbinger/internal/auth"
)

// ── Dashboard ──

func (h *Handlers) DashboardStats(w http.ResponseWriter, r *http.Request) {
	userID := GetUserID(r.Context())
	balance := h.credits.GetBalance(userID)
	scans := h.scanner.ListActiveScans()

	jsonResponse(w, map[string]interface{}{
		"total_scans":   len(scans),
		"active_scans":  len(scans),
		"credits":       balance,
		"open_findings": 0,
		"targets":       0,
	})
}

// ── Notifications ──

type notification struct {
	ID      string `json:"id"`
	Type    string `json:"type"`
	Title   string `json:"title"`
	Message string `json:"message"`
	Read    bool   `json:"read"`
	Time    string `json:"time"`
}

func (h *Handlers) ListNotifications(w http.ResponseWriter, r *http.Request) {
	// TODO: fetch from database
	jsonResponse(w, []notification{})
}

func (h *Handlers) MarkNotificationRead(w http.ResponseWriter, r *http.Request) {
	// TODO: mark notification read in database
	jsonResponse(w, map[string]string{"status": "ok"})
}

// ── Profile ──

func (h *Handlers) GetProfile(w http.ResponseWriter, r *http.Request) {
	userID := GetUserID(r.Context())
	jsonResponse(w, map[string]interface{}{
		"id":    userID,
		"email": GetEmail(r.Context()),
		"plan":  GetPlan(r.Context()),
	})
}

func (h *Handlers) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name  string `json:"name"`
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid request", http.StatusBadRequest)
		return
	}
	// TODO: update in database
	jsonResponse(w, map[string]string{"status": "updated"})
}

// ── API Keys ──

type apiKeyResponse struct {
	ID      string    `json:"id"`
	Name    string    `json:"name"`
	Prefix  string    `json:"prefix"`
	Scopes  []string  `json:"scopes"`
	Created time.Time `json:"created"`
}

func (h *Handlers) ListAPIKeys(w http.ResponseWriter, r *http.Request) {
	// TODO: fetch from database
	jsonResponse(w, []apiKeyResponse{})
}

func (h *Handlers) CreateAPIKey(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name   string   `json:"name"`
		Scopes []string `json:"scopes"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid request", http.StatusBadRequest)
		return
	}

	key, err := auth.GenerateAPIKey()
	if err != nil {
		jsonError(w, "failed to generate key", http.StatusInternalServerError)
		return
	}

	// TODO: store in database
	w.WriteHeader(http.StatusCreated)
	jsonResponse(w, map[string]interface{}{
		"key":    key,
		"name":   req.Name,
		"scopes": req.Scopes,
	})
}

func (h *Handlers) RevokeAPIKey(w http.ResponseWriter, r *http.Request) {
	// TODO: delete from database
	jsonResponse(w, map[string]string{"status": "revoked"})
}

// ── Webhooks ──

type webhookConfig struct {
	ID     string   `json:"id"`
	URL    string   `json:"url"`
	Events []string `json:"events"`
	Active bool     `json:"active"`
}

func (h *Handlers) ListWebhooks(w http.ResponseWriter, r *http.Request) {
	jsonResponse(w, []webhookConfig{})
}

func (h *Handlers) CreateWebhook(w http.ResponseWriter, r *http.Request) {
	var req struct {
		URL    string   `json:"url"`
		Events []string `json:"events"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid request", http.StatusBadRequest)
		return
	}

	if req.URL == "" {
		jsonError(w, "url is required", http.StatusBadRequest)
		return
	}

	// TODO: store in database
	w.WriteHeader(http.StatusCreated)
	jsonResponse(w, webhookConfig{
		ID:     "wh-new",
		URL:    req.URL,
		Events: req.Events,
		Active: true,
	})
}

func (h *Handlers) DeleteWebhook(w http.ResponseWriter, r *http.Request) {
	jsonResponse(w, map[string]string{"status": "deleted"})
}

// ── Findings & Reports ──

func (h *Handlers) ListFindings(w http.ResponseWriter, r *http.Request) {
	scanID := r.PathValue("id")
	active, ok := h.scanner.GetActiveScan(scanID)
	if !ok {
		jsonError(w, "scan not found", http.StatusNotFound)
		return
	}

	jsonResponse(w, map[string]interface{}{
		"scan_id":  scanID,
		"findings": active.Scan.Findings,
	})
}

func (h *Handlers) ExportReport(w http.ResponseWriter, r *http.Request) {
	scanID := r.PathValue("id")
	active, ok := h.scanner.GetActiveScan(scanID)
	if !ok {
		jsonError(w, "scan not found", http.StatusNotFound)
		return
	}

	format := r.URL.Query().Get("format")
	if format == "" {
		format = "json"
	}

	switch format {
	case "json":
		w.Header().Set("Content-Disposition", "attachment; filename=report-"+scanID+".json")
		jsonResponse(w, active.Scan)
	default:
		jsonResponse(w, map[string]interface{}{
			"scan":     active.Scan,
			"format":   format,
			"exported": time.Now().UTC(),
		})
	}
}
