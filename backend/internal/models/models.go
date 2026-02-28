package models

import "time"

type User struct {
	ID           string    `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	APIKey       string    `json:"api_key,omitempty"`
	Credits      int       `json:"credits"`
	Plan         string    `json:"plan"` // free, pro, enterprise
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type Scan struct {
	ID          string     `json:"id"`
	UserID      string     `json:"user_id"`
	Target      string     `json:"target"`
	ScanType    string     `json:"scan_type"` // full_audit, recon, vuln_scan, cloud_audit, osint
	Status      string     `json:"status"`    // pending, running, completed, failed, cancelled
	CreditsCost int        `json:"credits_cost"`
	StartedAt   *time.Time `json:"started_at,omitempty"`
	FinishedAt  *time.Time `json:"finished_at,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
}

type Finding struct {
	ID          string    `json:"id"`
	ScanID      string    `json:"scan_id"`
	AgentID     string    `json:"agent_id"`
	Title       string    `json:"title"`
	Severity    string    `json:"severity"` // critical, high, medium, low, info
	Target      string    `json:"target"`
	Description string    `json:"description"`
	Evidence    string    `json:"evidence,omitempty"`
	CVSS        float64   `json:"cvss,omitempty"`
	CVE         string    `json:"cve,omitempty"`
	Remediation string    `json:"remediation,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
}

type Container struct {
	ID            string    `json:"id"`
	ScanID        string    `json:"scan_id"`
	AgentID       string    `json:"agent_id"`
	DockerID      string    `json:"docker_id"`
	Image         string    `json:"image"`
	Status        string    `json:"status"` // creating, running, stopped, failed
	CPUPercent    float64   `json:"cpu_percent"`
	MemoryMB      float64   `json:"memory_mb"`
	CreatedAt     time.Time `json:"created_at"`
	StoppedAt     *time.Time `json:"stopped_at,omitempty"`
}

type AuditEntry struct {
	ID        string                 `json:"id"`
	UserID    string                 `json:"user_id"`
	Action    string                 `json:"action"`
	Resource  string                 `json:"resource"`
	Details   map[string]interface{} `json:"details,omitempty"`
	IP        string                 `json:"ip"`
	Timestamp time.Time              `json:"timestamp"`
}

type AgentConfig struct {
	ID       string   `json:"id"`
	Name     string   `json:"name"`
	Role     string   `json:"role"`
	Color    string   `json:"color"`
	Image    string   `json:"image"`    // Docker image
	Tools    []string `json:"tools"`
	Priority int      `json:"priority"` // execution order
}

type ScanEvent struct {
	Type      string      `json:"type"`
	ScanID    string      `json:"scan_id"`
	AgentID   string      `json:"agent_id,omitempty"`
	Data      interface{} `json:"data"`
	Timestamp time.Time   `json:"timestamp"`
}

type WebhookPayload struct {
	Event   string      `json:"event"`
	ScanID  string      `json:"scan_id"`
	Data    interface{} `json:"data"`
	SentAt  time.Time   `json:"sent_at"`
}

// Credit costs per scan type
var ScanCreditCosts = map[string]int{
	"recon":       1,
	"vuln_scan":   2,
	"full_audit":  3,
	"cloud_audit": 3,
	"osint":       1,
}
