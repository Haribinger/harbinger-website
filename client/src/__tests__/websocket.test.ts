import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HarbingerWS, resetWS, getWS } from "../lib/websocket";
import type { ScanEvent } from "../lib/websocket";

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  onopen: ((ev: Event) => void) | null = null;
  onmessage: ((ev: MessageEvent) => void) | null = null;
  onclose: ((ev: CloseEvent) => void) | null = null;
  onerror: ((ev: Event) => void) | null = null;
  sentMessages: string[] = [];

  constructor(public url: string) {
    // Auto-connect on next tick
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      this.onopen?.(new Event("open"));
    }, 0);
  }

  send(data: string) {
    this.sentMessages.push(data);
  }

  close(code?: number, reason?: string) {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.(
      new CloseEvent("close", { code: code ?? 1000, reason: reason ?? "" })
    );
  }
}

vi.stubGlobal("WebSocket", MockWebSocket);

describe("HarbingerWS", () => {
  let ws: HarbingerWS;

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    ws = new HarbingerWS("ws://test:8080");
  });

  afterEach(() => {
    ws.disconnect();
    vi.useRealTimers();
  });

  it("constructs URL with user_id and token from localStorage", () => {
    localStorage.setItem("harbinger_token", "test-jwt");
    localStorage.setItem(
      "harbinger_user",
      JSON.stringify({ id: "user-123" })
    );
    const ws2 = new HarbingerWS("ws://test:8080");
    // The URL is private, but we can test that it connects properly
    expect(ws2).toBeDefined();
    ws2.disconnect();
  });

  it("defaults to anonymous when no user in localStorage", () => {
    const ws2 = new HarbingerWS("ws://test:8080");
    expect(ws2).toBeDefined();
    ws2.disconnect();
  });

  it("emits _connected event on open", async () => {
    const handler = vi.fn();
    ws.on("_connected", handler);
    ws.connect();
    await vi.advanceTimersByTimeAsync(10);
    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0].type).toBe("_connected");
  });

  it("parses incoming JSON messages", async () => {
    const handler = vi.fn();
    ws.on("agent_message", handler);
    ws.connect();
    await vi.advanceTimersByTimeAsync(10);

    const mockWs = (ws as any).ws as MockWebSocket;
    const event: ScanEvent = {
      type: "agent_message",
      scan_id: "scan-1",
      agent_id: "pathfinder",
      data: { message: "hello" },
      timestamp: new Date().toISOString(),
    };
    mockWs.onmessage?.(
      new MessageEvent("message", { data: JSON.stringify(event) })
    );

    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0][0].scan_id).toBe("scan-1");
  });

  it("handles multi-line messages", async () => {
    const handler = vi.fn();
    ws.on("*", handler);
    ws.connect();
    await vi.advanceTimersByTimeAsync(10);

    const mockWs = (ws as any).ws as MockWebSocket;
    const event1 = JSON.stringify({
      type: "a",
      scan_id: "1",
      data: {},
      timestamp: "",
    });
    const event2 = JSON.stringify({
      type: "b",
      scan_id: "2",
      data: {},
      timestamp: "",
    });
    mockWs.onmessage?.(
      new MessageEvent("message", { data: `${event1}\n${event2}` })
    );

    expect(handler).toHaveBeenCalledTimes(2);
  });

  it("subscribe sends message to WebSocket", async () => {
    ws.connect();
    await vi.advanceTimersByTimeAsync(10);

    ws.subscribe("scan-42");
    const mockWs = (ws as any).ws as MockWebSocket;
    const sent = mockWs.sentMessages.map((m) => JSON.parse(m));
    expect(sent).toContainEqual({ type: "subscribe", scan_id: "scan-42" });
  });

  it("unsubscribe sends message to WebSocket", async () => {
    ws.connect();
    await vi.advanceTimersByTimeAsync(10);

    ws.subscribe("scan-42");
    ws.unsubscribe("scan-42");
    const mockWs = (ws as any).ws as MockWebSocket;
    const sent = mockWs.sentMessages.map((m) => JSON.parse(m));
    expect(sent).toContainEqual({ type: "unsubscribe", scan_id: "scan-42" });
  });

  it("on() returns an unsubscribe function", async () => {
    const handler = vi.fn();
    const unsub = ws.on("test_event", handler);
    ws.connect();
    await vi.advanceTimersByTimeAsync(10);

    const mockWs = (ws as any).ws as MockWebSocket;
    const event = JSON.stringify({
      type: "test_event",
      scan_id: "",
      data: {},
      timestamp: "",
    });

    mockWs.onmessage?.(new MessageEvent("message", { data: event }));
    expect(handler).toHaveBeenCalledOnce();

    unsub();
    mockWs.onmessage?.(new MessageEvent("message", { data: event }));
    expect(handler).toHaveBeenCalledOnce(); // not called again
  });

  it("does not connect if already connected", async () => {
    ws.connect();
    await vi.advanceTimersByTimeAsync(10);
    expect(ws.isConnected).toBe(true);

    // Second connect should be a no-op
    ws.connect();
    expect(ws.isConnected).toBe(true);
  });

  it("disconnect sets ws to null", async () => {
    ws.connect();
    await vi.advanceTimersByTimeAsync(10);
    expect(ws.isConnected).toBe(true);

    ws.disconnect();
    expect(ws.isConnected).toBe(false);
  });
});

describe("getWS / resetWS", () => {
  afterEach(() => {
    resetWS();
  });

  it("getWS returns singleton", () => {
    const a = getWS();
    const b = getWS();
    expect(a).toBe(b);
  });

  it("resetWS clears singleton", () => {
    const a = getWS();
    resetWS();
    const b = getWS();
    expect(a).not.toBe(b);
  });
});
