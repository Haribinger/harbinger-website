package audit

import (
	"encoding/json"
	"log"
	"os"
	"path/filepath"
	"sync"
	"time"

	"github.com/harbinger-ai/harbinger/internal/models"
)

type Logger struct {
	mu   sync.Mutex
	file *os.File
	enc  *json.Encoder
}

func NewLogger(path string) (*Logger, error) {
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, err
	}

	f, err := os.OpenFile(path, os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0644)
	if err != nil {
		return nil, err
	}

	return &Logger{
		file: f,
		enc:  json.NewEncoder(f),
	}, nil
}

func (l *Logger) Log(userID, action, resource, ip string, details map[string]interface{}) {
	entry := models.AuditEntry{
		ID:        generateID(),
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

func (l *Logger) Close() error {
	l.mu.Lock()
	defer l.mu.Unlock()
	return l.file.Close()
}

func generateID() string {
	b := make([]byte, 16)
	_, _ = os.Stdin.Read(b) // fallback
	return time.Now().Format("20060102150405") + "-" + randomHex(8)
}

func randomHex(n int) string {
	b := make([]byte, n)
	for i := range b {
		b[i] = "0123456789abcdef"[int(time.Now().UnixNano()%16)]
	}
	return string(b)
}
