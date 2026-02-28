import { useCallback, useEffect, useRef, useState } from "react";
import { createScan, getCredits } from "@/lib/api";
import { getWS } from "@/lib/websocket";
import type { ScanEvent } from "@/lib/websocket";
import type {
  AgentId,
  BrowserState,
  ChatMsg,
  DockerContainer,
  Finding,
  NetworkConnection,
  ToolOutputLine,
} from "./types";

let msgIdCounter = 0;
function nextId(): string {
  return `msg-${++msgIdCounter}`;
}

export interface RealEngineState {
  messages: ChatMsg[];
  activeAgents: Map<AgentId, string>;
  isPlaying: boolean;
  containers: DockerContainer[];
  networkConnections: NetworkConnection[];
  browserState: BrowserState | null;
  dockerLogs: ToolOutputLine[];
  credits: number;
  maxCredits: number;
  connectionError: string | null;
  currentScanId: string | null;
}

export function useRealEngine() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [activeAgents, setActiveAgents] = useState<Map<AgentId, string>>(new Map());
  const [isPlaying, setIsPlaying] = useState(false);
  const [containers, setContainers] = useState<DockerContainer[]>([]);
  const [networkConnections, setNetworkConnections] = useState<NetworkConnection[]>([]);
  const [browserState, setBrowserState] = useState<BrowserState | null>(null);
  const [dockerLogs, setDockerLogs] = useState<ToolOutputLine[]>([]);
  const [credits, setCredits] = useState(10);
  const [maxCredits] = useState(10);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [currentScanId, setCurrentScanId] = useState<string | null>(null);
  const unsubscribeRef = useRef<Array<() => void>>([]);

  // Load credits from backend on mount
  useEffect(() => {
    getCredits()
      .then((data: { remaining?: number; balance?: number }) => {
        const val = data.remaining ?? data.balance ?? 10;
        setCredits(val);
      })
      .catch(() => {
        // Backend not running, keep localStorage-based fallback value
      });
  }, []);

  const addMessage = useCallback((msg: ChatMsg) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const setAgentStatus = useCallback((agent: AgentId, status: string | null) => {
    setActiveAgents((prev) => {
      const next = new Map(prev);
      if (status) {
        next.set(agent, status);
      } else {
        next.delete(agent);
      }
      return next;
    });
  }, []);

  const addDockerLog = useCallback((lines: ToolOutputLine[]) => {
    setDockerLogs((prev) => [...prev, ...lines]);
  }, []);

  // Clean up WebSocket listeners for a scan
  const cleanupScanListeners = useCallback(() => {
    unsubscribeRef.current.forEach((fn) => fn());
    unsubscribeRef.current = [];
  }, []);

  const handleScanEvent = useCallback(
    (event: ScanEvent) => {
      const agentId = (event.agent_id ?? "pathfinder") as AgentId;

      switch (event.type) {
        case "agent_message": {
          const text = String(event.data.text ?? event.data.content ?? "");
          if (!text) return;
          setAgentStatus(agentId, "responding");
          addMessage({
            id: nextId(),
            type: "agent_message",
            agent: agentId,
            text,
            isStreaming: false,
          });
          break;
        }

        case "agent_thinking": {
          setAgentStatus(agentId, "thinking");
          addMessage({ id: nextId(), type: "thinking", agent: agentId });
          break;
        }

        case "tool_call": {
          const tool = String(event.data.tool ?? event.data.tool_name ?? "");
          const command = String(event.data.command ?? event.data.cmd ?? tool);
          setAgentStatus(agentId, `running ${tool}`);
          addMessage({
            id: nextId(),
            type: "tool_call",
            agent: agentId,
            tool,
            command,
            toolProgress: 0,
            toolDuration: 2000,
            toolOutputLines: [],
            toolOutputIndex: 0,
          });
          addDockerLog([{ text: `$ ${command}`, color: "#00d4ff" }]);
          break;
        }

        case "tool_result": {
          const result = String(event.data.result ?? event.data.output ?? "");
          const status = (event.data.status as "success" | "warning" | "error") ?? "success";
          addMessage({
            id: nextId(),
            type: "tool_result",
            agent: agentId,
            text: result,
            toolStatus: status,
          });
          addDockerLog([
            {
              text: `[result] ${result}`,
              color: status === "success" ? "#4ade80" : status === "warning" ? "#f59e0b" : "#ef4444",
            },
          ]);
          setAgentStatus(agentId, "idle");
          break;
        }

        case "finding": {
          const finding: Finding = {
            title: String(event.data.title ?? "Unknown Finding"),
            severity: (event.data.severity as Finding["severity"]) ?? "info",
            target: String(event.data.target ?? event.data.host ?? ""),
            description: String(event.data.description ?? ""),
            evidence: event.data.evidence ? String(event.data.evidence) : undefined,
            cvss: event.data.cvss ? Number(event.data.cvss) : undefined,
          };
          addMessage({
            id: nextId(),
            type: "finding",
            agent: agentId,
            finding,
          });
          addDockerLog([
            {
              text: `[${finding.severity.toUpperCase()}] ${finding.title}`,
              color:
                finding.severity === "critical"
                  ? "#ef4444"
                  : finding.severity === "high"
                    ? "#f97316"
                    : "#f59e0b",
            },
          ]);
          break;
        }

        case "handoff": {
          const fromAgent = (event.data.from ?? agentId) as AgentId;
          const toAgent = (event.data.to ?? "breach") as AgentId;
          const reason = String(event.data.reason ?? "");
          setAgentStatus(fromAgent, null);
          addMessage({
            id: nextId(),
            type: "handoff",
            fromAgent,
            toAgent,
            handoffReason: reason,
          });
          addDockerLog([
            {
              text: `⇢ Handoff: ${String(fromAgent).toUpperCase()} → ${String(toAgent).toUpperCase()} (${reason})`,
              color: "#a78bfa",
            },
          ]);
          break;
        }

        case "docker_spawn": {
          const containerId = String(event.data.container_id ?? event.data.id ?? nextId());
          const containerName = String(event.data.name ?? event.data.container_name ?? containerId.slice(0, 12));
          const image = String(event.data.image ?? "harbinger/tool:latest");

          const newContainer: DockerContainer = {
            id: containerId,
            name: containerName,
            image,
            agent: agentId,
            status: "creating",
            cpu: 0,
            memory: 0,
          };
          setContainers((prev) => [...prev, newContainer]);
          addMessage({
            id: nextId(),
            type: "docker_spawn",
            agent: agentId,
            containerId,
            containerName,
            containerImage: image,
          });
          addDockerLog([
            { text: ``, color: "#555" },
            { text: `$ docker run -d --name ${containerName} ${image}`, color: "#00d4ff" },
            { text: `Pulling image ${image}...`, color: "#888" },
          ]);

          // Transition to running after short delay
          setTimeout(() => {
            setContainers((prev) =>
              prev.map((c) =>
                c.id === containerId
                  ? { ...c, status: "running", cpu: 5 + Math.random() * 15, memory: 64 + Math.random() * 60 }
                  : c
              )
            );
            addDockerLog([
              { text: `Container ${containerId.slice(0, 12)} created. Status: running`, color: "#4ade80" },
            ]);
          }, 600);
          break;
        }

        case "docker_log": {
          // event.data.lines is array of strings or ToolOutputLine
          const rawLines = Array.isArray(event.data.lines) ? event.data.lines : [];
          const lines: ToolOutputLine[] = rawLines.map((l) => {
            if (typeof l === "string") return { text: l, color: "#888" };
            return { text: String(l.text ?? l), color: String(l.color ?? "#888") };
          });
          addDockerLog(lines);

          // Also update the tool_call message with new output lines if there's a recent tool call
          setMessages((prev) => {
            // Find most recent tool_call message that isn't complete
            const lastToolIdx = [...prev].reverse().findIndex((m) => m.type === "tool_call" && (m.toolProgress ?? 0) < 100);
            if (lastToolIdx === -1) return prev;
            const realIdx = prev.length - 1 - lastToolIdx;
            return prev.map((m, i) => {
              if (i !== realIdx) return m;
              const newLines = [...(m.toolOutputLines ?? []), ...lines];
              return { ...m, toolOutputLines: newLines, toolOutputIndex: newLines.length };
            });
          });
          break;
        }

        case "docker_stop": {
          const containerId = String(event.data.container_id ?? event.data.id ?? "");
          setContainers((prev) =>
            prev.map((c) =>
              c.id === containerId ? { ...c, status: "stopped", cpu: 0, memory: 0 } : c
            )
          );
          addDockerLog([
            { text: `$ docker stop ${containerId.slice(0, 12)}`, color: "#f59e0b" },
            { text: `Container stopped.`, color: "#888" },
          ]);
          break;
        }

        case "scan_progress": {
          const pct = Number(event.data.progress ?? 0);
          const statusText = String(event.data.status ?? `${pct}%`);
          // Update current tool_call progress if any
          setMessages((prev) =>
            prev.map((m) =>
              m.type === "tool_call" && (m.toolProgress ?? 0) < 100
                ? { ...m, toolProgress: pct }
                : m
            )
          );
          // Update the scan agent's status
          setAgentStatus(agentId, statusText);
          break;
        }

        case "scan_complete": {
          const findings = Number(event.data.findings_count ?? 0);
          const tokens = Number(event.data.tokens ?? 0);
          const tools = Number(event.data.tools_used ?? 0);
          const durationMs = Number(event.data.duration_ms ?? 0);
          const duration = durationMs > 0 ? `${(durationMs / 1000).toFixed(1)}s` : "—";
          const containerCount = Number(event.data.containers ?? 0);

          // Mark all running tool calls as complete
          setMessages((prev) =>
            prev.map((m) =>
              m.type === "tool_call" && (m.toolProgress ?? 0) < 100
                ? { ...m, toolProgress: 100, toolOutputIndex: m.toolOutputLines?.length ?? 0 }
                : m
            )
          );

          addMessage({
            id: nextId(),
            type: "cost_summary",
            tokens,
            toolsUsed: tools,
            findingsCount: findings,
            duration,
            containersUsed: containerCount,
          });

          // Stop all containers
          setContainers((prev) => prev.map((c) => ({ ...c, status: "stopped" as const, cpu: 0, memory: 0 })));
          setNetworkConnections([]);
          setActiveAgents(new Map());
          setIsPlaying(false);

          addDockerLog([
            { text: ``, color: "#555" },
            { text: `══════ Scan Complete ══════`, color: "#00d4ff" },
            { text: `Findings: ${findings} | Tools: ${tools} | Duration: ${duration}`, color: "#888" },
          ]);

          // Refresh credits
          getCredits()
            .then((data: { remaining?: number; balance?: number }) => {
              const val = data.remaining ?? data.balance;
              if (val !== undefined) setCredits(val);
            })
            .catch(() => {});
          break;
        }

        case "network_activity": {
          const rawConns = Array.isArray(event.data.connections) ? event.data.connections : [];
          const conns: NetworkConnection[] = rawConns.map(
            (c: { from?: string; to?: string; label?: string }, i: number) => ({
              id: `net-${Date.now()}-${i}`,
              from: (c.from ?? agentId) as AgentId,
              to: String(c.to ?? "target"),
              label: String(c.label ?? ""),
              active: true,
            })
          );
          setNetworkConnections((prev) => [...prev, ...conns]);

          addDockerLog(
            conns.map((c) => ({
              text: `[net] ${String(c.from).toUpperCase()} → ${c.to} (${c.label})`,
              color: "#22d3ee",
            }))
          );

          // Deactivate after a timeout
          setTimeout(() => {
            setNetworkConnections((prev) =>
              prev.map((nc) => (conns.find((c) => c.id === nc.id) ? { ...nc, active: false } : nc))
            );
          }, 4000);
          break;
        }

        case "browser_navigate": {
          const url = String(event.data.url ?? "");
          const title = String(event.data.title ?? "");
          const statusCode = Number(event.data.status_code ?? event.data.statusCode ?? 200);
          setAgentStatus(agentId, `browsing ${url}`);
          setBrowserState({
            url,
            title,
            statusCode,
            agentOverlay: `${String(agentId).toUpperCase()} is analyzing page...`,
            actions: [],
          });
          addMessage({
            id: nextId(),
            type: "browser_navigate",
            agent: agentId,
            browserUrl: url,
            browserTitle: title,
            browserStatusCode: statusCode,
          });
          addDockerLog([
            { text: `[browser] Navigating to ${url}`, color: "#00d4ff" },
            { text: `[browser] HTTP ${statusCode} | ${title}`, color: statusCode < 400 ? "#4ade80" : "#f59e0b" },
          ]);
          break;
        }

        case "error": {
          const errMsg = String(event.data.message ?? event.data.error ?? "Unknown error");
          setConnectionError(errMsg);
          setIsPlaying(false);
          addDockerLog([{ text: `[ERROR] ${errMsg}`, color: "#ef4444" }]);
          break;
        }

        default:
          // Unknown event — log to docker console for debugging
          addDockerLog([
            { text: `[event:${event.type}] ${JSON.stringify(event.data).slice(0, 120)}`, color: "#555" },
          ]);
          break;
      }
    },
    [addMessage, setAgentStatus, addDockerLog]
  );

  const startScan = useCallback(
    async (target: string, scanType: string = "recon", userMessage?: string) => {
      setConnectionError(null);

      // Reset state (clear previous scan's messages)
      setIsPlaying(true);
      setMessages([]);

      // Add user message to chat first
      if (userMessage) {
        addMessage({ id: nextId(), type: "user", text: userMessage });
      }
      setContainers([]);
      setNetworkConnections([]);
      setBrowserState(null);
      setDockerLogs([
        { text: "═══ Harbinger Agent Swarm ═══", color: "#00d4ff" },
        { text: `Target: ${target} | Type: ${scanType}`, color: "#888" },
        { text: `Connecting...`, color: "#4ade80" },
        { text: ``, color: "#555" },
      ]);

      // Clean up previous listeners
      cleanupScanListeners();

      let scanId: string;
      try {
        const scanData = await createScan({
          target,
          scan_type: scanType as "recon" | "vuln_scan" | "full_audit" | "cloud_audit" | "osint",
        });
        scanId = scanData.id ?? scanData.scan_id;
        setCurrentScanId(scanId);
        addDockerLog([{ text: `Scan started: ${scanId}`, color: "#4ade80" }]);
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        const friendlyMsg = errMsg.includes("Network Error") || errMsg.includes("ECONNREFUSED")
          ? "Cannot connect to backend (is it running on port 8080?)"
          : `Failed to start scan: ${errMsg}`;
        setConnectionError(friendlyMsg);
        setIsPlaying(false);
        addDockerLog([{ text: `[ERROR] ${friendlyMsg}`, color: "#ef4444" }]);
        addMessage({
          id: nextId(),
          type: "agent_message",
          agent: "pathfinder",
          text: `Connection error: ${friendlyMsg}`,
          isStreaming: false,
        });
        return;
      }

      // Connect WebSocket and subscribe
      const ws = getWS();
      ws.connect();
      ws.subscribe(scanId);

      // Register handlers
      const unsubs: Array<() => void> = [];

      const eventTypes = [
        "agent_message",
        "agent_thinking",
        "tool_call",
        "tool_result",
        "finding",
        "handoff",
        "docker_spawn",
        "docker_log",
        "docker_stop",
        "scan_progress",
        "scan_complete",
        "network_activity",
        "browser_navigate",
        "error",
      ];

      eventTypes.forEach((evType) => {
        const handler = (ev: ScanEvent) => {
          if (ev.scan_id === scanId) {
            handleScanEvent(ev);
          }
        };
        unsubs.push(ws.on(evType, handler));
      });

      // Handle connection error
      const disconnectHandler = (ev: ScanEvent) => {
        const data = ev.data as { code?: number };
        if (data.code !== 1000) {
          setConnectionError("WebSocket disconnected unexpectedly. Events may be missed.");
        }
      };
      unsubs.push(ws.on("_disconnected", disconnectHandler));

      unsubscribeRef.current = unsubs;
    },
    [addMessage, addDockerLog, handleScanEvent, cleanupScanListeners]
  );

  const cancel = useCallback(() => {
    cleanupScanListeners();
    setIsPlaying(false);
    setActiveAgents(new Map());
    if (currentScanId) {
      // Optionally call cancelScan(currentScanId) but don't block UI
    }
  }, [cleanupScanListeners, currentScanId]);

  const reset = useCallback(() => {
    cleanupScanListeners();
    setIsPlaying(false);
    setMessages([]);
    setActiveAgents(new Map());
    setContainers([]);
    setNetworkConnections([]);
    setBrowserState(null);
    setDockerLogs([]);
    setConnectionError(null);
    setCurrentScanId(null);
  }, [cleanupScanListeners]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupScanListeners();
    };
  }, [cleanupScanListeners]);

  return {
    messages,
    activeAgents,
    isPlaying,
    containers,
    networkConnections,
    browserState,
    dockerLogs,
    credits,
    maxCredits,
    connectionError,
    currentScanId,
    startScan,
    cancel,
    reset,
  };
}
