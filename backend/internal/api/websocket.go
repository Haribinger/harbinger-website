package api

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"github.com/harbinger-ai/harbinger/internal/models"
)

// newUpgrader returns a WebSocket upgrader that validates origins against the
// provided allowed-origins list (e.g. from config.AllowedOrigins). Non-browser
// clients that send no Origin header are always allowed through.
func newUpgrader(origins []string) websocket.Upgrader {
	return websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 4096,
		CheckOrigin: func(r *http.Request) bool {
			origin := r.Header.Get("Origin")
			if origin == "" {
				// Non-browser clients (CLI tools, tests) carry no Origin header.
				return true
			}
			for _, allowed := range origins {
				if strings.EqualFold(origin, allowed) {
					return true
				}
			}
			log.Printf("ws: rejected connection from origin %q", origin)
			return false
		},
	}
}

type WSClient struct {
	conn    *websocket.Conn
	userID  string
	scanIDs map[string]bool // subscribed scan IDs
	send    chan []byte
	mu      sync.Mutex
}

type WSHub struct {
	mu       sync.RWMutex
	clients  map[*WSClient]bool
	upgrader websocket.Upgrader
}

// NewWSHub creates a WebSocket hub that validates connection origins against
// the provided allowedOrigins list.
func NewWSHub(allowedOrigins []string) *WSHub {
	return &WSHub{
		clients:  make(map[*WSClient]bool),
		upgrader: newUpgrader(allowedOrigins),
	}
}

// Register adds a new WebSocket client to the hub.
func (h *WSHub) Register(client *WSClient) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.clients[client] = true
	log.Printf("ws: client connected (user=%s, total=%d)", client.userID, len(h.clients))
}

// Unregister removes a WebSocket client from the hub and closes its send channel.
func (h *WSHub) Unregister(client *WSClient) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if _, ok := h.clients[client]; ok {
		delete(h.clients, client)
		close(client.send)
		log.Printf("ws: client disconnected (user=%s, total=%d)", client.userID, len(h.clients))
	}
}

// BroadcastToScan sends an event to all clients subscribed to a scan
func (h *WSHub) BroadcastToScan(scanID string, event models.ScanEvent) {
	data, err := json.Marshal(event)
	if err != nil {
		log.Printf("ws: marshal error: %v", err)
		return
	}

	h.mu.RLock()
	defer h.mu.RUnlock()

	for client := range h.clients {
		client.mu.Lock()
		subscribed := client.scanIDs[scanID]
		client.mu.Unlock()

		if subscribed {
			select {
			case client.send <- data:
			default:
				// client buffer full, skip
				log.Printf("ws: dropping message for slow client (user=%s)", client.userID)
			}
		}
	}
}

// BroadcastToUser sends an event to all connections for a specific user
func (h *WSHub) BroadcastToUser(userID string, event models.ScanEvent) {
	data, err := json.Marshal(event)
	if err != nil {
		return
	}

	h.mu.RLock()
	defer h.mu.RUnlock()

	for client := range h.clients {
		if client.userID == userID {
			select {
			case client.send <- data:
			default:
			}
		}
	}
}

// HandleWS upgrades an HTTP connection to WebSocket and registers the client.
func (h *WSHub) HandleWS(w http.ResponseWriter, r *http.Request) {
	conn, err := h.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("ws: upgrade error: %v", err)
		return
	}

	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		userID = "anonymous"
	}

	client := &WSClient{
		conn:    conn,
		userID:  userID,
		scanIDs: make(map[string]bool),
		send:    make(chan []byte, 256),
	}

	h.Register(client)

	go client.writePump(h)
	go client.readPump(h)
}

func (c *WSClient) readPump(hub *WSHub) {
	defer func() {
		hub.Unregister(c)
		c.conn.Close()
	}()

	c.conn.SetReadLimit(4096)
	c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseNormalClosure) {
				log.Printf("ws: read error: %v", err)
			}
			break
		}

		// Parse subscription messages
		var msg struct {
			Type   string `json:"type"`
			ScanID string `json:"scan_id"`
		}
		if json.Unmarshal(message, &msg) == nil {
			switch msg.Type {
			case "subscribe":
				c.mu.Lock()
				c.scanIDs[msg.ScanID] = true
				c.mu.Unlock()
				log.Printf("ws: client subscribed to scan %s", msg.ScanID)
			case "unsubscribe":
				c.mu.Lock()
				delete(c.scanIDs, msg.ScanID)
				c.mu.Unlock()
			}
		}
	}
}

func (c *WSClient) writePump(hub *WSHub) {
	ticker := time.NewTicker(30 * time.Second)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Drain queued messages
			n := len(c.send)
			for i := 0; i < n; i++ {
				w.Write([]byte("\n"))
				w.Write(<-c.send)
			}

			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
