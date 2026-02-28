type EventHandler = (event: ScanEvent) => void;

export interface ScanEvent {
  type: string;
  scan_id: string;
  agent_id?: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export class HarbingerWS {
  private ws: WebSocket | null = null;
  private url: string;
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private subscribedScans: Set<string> = new Set();

  constructor(baseURL?: string) {
    const wsBase = baseURL || import.meta.env.VITE_WS_URL || "ws://localhost:8080";
    const token = localStorage.getItem("harbinger_token") || "";
    const userId = (() => {
      try {
        const user = JSON.parse(localStorage.getItem("harbinger_user") || "{}");
        return user.id || "anonymous";
      } catch {
        return "anonymous";
      }
    })();
    this.url = `${wsBase}/api/ws?user_id=${userId}&token=${token}`;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.debug("[harbinger-ws] connected");
      this.reconnectAttempts = 0;

      // Re-subscribe to active scans
      this.subscribedScans.forEach((scanId) => {
        this.send({ type: "subscribe", scan_id: scanId });
      });

      this.emit("_connected", {
        type: "_connected",
        scan_id: "",
        data: {},
        timestamp: new Date().toISOString(),
      });
    };

    this.ws.onmessage = (event) => {
      const lines = event.data.split("\n");
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const scanEvent: ScanEvent = JSON.parse(line);
          this.emit(scanEvent.type, scanEvent);
          this.emit("*", scanEvent); // wildcard handler
        } catch (err) {
          console.warn("[harbinger-ws] parse error:", err);
        }
      }
    };

    this.ws.onclose = (event) => {
      console.debug("[harbinger-ws] disconnected:", event.code, event.reason);
      this.emit("_disconnected", {
        type: "_disconnected",
        scan_id: "",
        data: { code: event.code, reason: event.reason },
        timestamp: new Date().toISOString(),
      });
      this.scheduleReconnect();
    };

    this.ws.onerror = (err) => {
      console.error("[harbinger-ws] error:", err);
    };
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.maxReconnectAttempts = 0; // prevent reconnect
    if (this.ws) {
      this.ws.close(1000, "client disconnect");
      this.ws = null;
    }
  }

  subscribe(scanId: string): void {
    this.subscribedScans.add(scanId);
    this.send({ type: "subscribe", scan_id: scanId });
  }

  unsubscribe(scanId: string): void {
    this.subscribedScans.delete(scanId);
    this.send({ type: "unsubscribe", scan_id: scanId });
  }

  on(eventType: string, handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }

  private emit(eventType: string, event: ScanEvent): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(event);
        } catch (err) {
          console.error("[harbinger-ws] handler error:", err);
        }
      });
    }
  }

  private send(data: Record<string, unknown>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.debug("[harbinger-ws] max reconnect attempts reached");
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    console.debug(`[harbinger-ws] reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
let instance: HarbingerWS | null = null;

export function getWS(): HarbingerWS {
  if (!instance) {
    instance = new HarbingerWS();
  }
  return instance;
}

export function resetWS(): void {
  if (instance) {
    instance.disconnect();
    instance = null;
  }
}
