import { useCallback, useRef, useState } from "react";
import type {
  AgentId,
  BrowserState,
  ChatMsg,
  DockerContainer,
  NetworkConnection,
  Scenario,
  ScenarioEvent,
  ToolOutputLine,
} from "./types";

let msgIdCounter = 0;
function nextId(): string {
  return `msg-${++msgIdCounter}`;
}

function sleep(ms: number, cancel: React.RefObject<boolean>): Promise<boolean> {
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve(!cancel.current), ms);
    const check = setInterval(() => {
      if (cancel.current) {
        clearTimeout(t);
        clearInterval(check);
        resolve(false);
      }
    }, 50);
    setTimeout(() => clearInterval(check), ms + 10);
  });
}

function randomFluctuate(base: number, variance: number): number {
  return Math.max(0, Math.min(100, base + (Math.random() - 0.5) * variance));
}

export function useScenarioEngine() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [activeAgents, setActiveAgents] = useState<Map<AgentId, string>>(new Map());
  const [isPlaying, setIsPlaying] = useState(false);
  const [containers, setContainers] = useState<DockerContainer[]>([]);
  const [networkConnections, setNetworkConnections] = useState<NetworkConnection[]>([]);
  const [browserState, setBrowserState] = useState<BrowserState | null>(null);
  const [dockerLogs, setDockerLogs] = useState<ToolOutputLine[]>([]);
  const cancelRef = useRef(false);

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

  const processEvent = useCallback(
    async (event: ScenarioEvent): Promise<boolean> => {
      if (cancelRef.current) return false;

      switch (event.type) {
        case "agent_thinking": {
          setAgentStatus(event.agent, "thinking");
          const id = nextId();
          addMessage({ id, type: "thinking", agent: event.agent });
          const ok = await sleep(event.duration, cancelRef);
          if (!ok) return false;
          setMessages((prev) => prev.filter((m) => m.id !== id));
          return true;
        }

        case "agent_message": {
          setAgentStatus(event.agent, "responding");
          const id = nextId();
          const charDelay = event.charDelay ?? 20;
          addMessage({ id, type: "agent_message", agent: event.agent, text: "", isStreaming: true });

          for (let i = 0; i < event.text.length; i++) {
            if (cancelRef.current) return false;
            const partial = event.text.slice(0, i + 1);
            setMessages((prev) =>
              prev.map((m) => (m.id === id ? { ...m, text: partial } : m))
            );
            const char = event.text[i];
            const delay = /[\s,.]/.test(char) ? Math.max(5, charDelay * 0.3) : charDelay;
            await new Promise((r) => setTimeout(r, delay));
          }

          setMessages((prev) =>
            prev.map((m) => (m.id === id ? { ...m, isStreaming: false } : m))
          );
          setAgentStatus(event.agent, "idle");
          return true;
        }

        case "tool_call": {
          setAgentStatus(event.agent, `running ${event.tool}`);
          const id = nextId();
          const outputLines = event.outputLines ?? [];
          addMessage({
            id,
            type: "tool_call",
            agent: event.agent,
            tool: event.tool,
            command: event.command,
            toolProgress: 0,
            toolDuration: event.duration,
            toolOutputLines: outputLines,
            toolOutputIndex: 0,
          });

          // Add to docker logs
          addDockerLog([
            { text: `$ ${event.command}`, color: "#00d4ff" },
          ]);

          const steps = 30;
          const stepTime = event.duration / steps;
          const linesPerStep = outputLines.length > 0 ? Math.max(1, Math.floor(outputLines.length / steps)) : 0;

          for (let i = 1; i <= steps; i++) {
            if (cancelRef.current) return false;
            const progress = Math.min(100, (i / steps) * 100);
            const lineIdx = Math.min(outputLines.length, i * linesPerStep);

            setMessages((prev) =>
              prev.map((m) => (m.id === id ? { ...m, toolProgress: progress, toolOutputIndex: lineIdx } : m))
            );

            // Add lines to docker log as they appear
            if (linesPerStep > 0 && i <= steps) {
              const startLine = (i - 1) * linesPerStep;
              const endLine = Math.min(outputLines.length, i * linesPerStep);
              if (startLine < endLine) {
                addDockerLog(outputLines.slice(startLine, endLine));
              }
            }

            // Fluctuate container resource usage
            setContainers((prev) =>
              prev.map((c) =>
                c.status === "running"
                  ? { ...c, cpu: randomFluctuate(c.cpu, 20), memory: randomFluctuate(c.memory, 30) }
                  : c
              )
            );

            await new Promise((r) => setTimeout(r, stepTime));
          }

          // Reveal remaining lines
          setMessages((prev) =>
            prev.map((m) =>
              m.id === id ? { ...m, toolProgress: 100, toolOutputIndex: outputLines.length } : m
            )
          );

          addDockerLog([{ text: `✓ ${event.tool} completed`, color: "#4ade80" }]);
          setAgentStatus(event.agent, "idle");
          return true;
        }

        case "tool_result": {
          addMessage({
            id: nextId(),
            type: "tool_result",
            agent: event.agent,
            text: event.result,
            toolStatus: event.status,
          });
          addDockerLog([{
            text: `[result] ${event.result}`,
            color: event.status === "success" ? "#4ade80" : event.status === "warning" ? "#f59e0b" : "#ef4444",
          }]);
          return await sleep(500, cancelRef);
        }

        case "finding": {
          addMessage({
            id: nextId(),
            type: "finding",
            agent: event.agent,
            finding: event.finding,
          });
          addDockerLog([{
            text: `[${event.finding.severity.toUpperCase()}] ${event.finding.title}`,
            color: event.finding.severity === "critical" ? "#ef4444" : event.finding.severity === "high" ? "#f97316" : "#f59e0b",
          }]);
          return await sleep(800, cancelRef);
        }

        case "handoff": {
          setAgentStatus(event.from, null);
          addMessage({
            id: nextId(),
            type: "handoff",
            fromAgent: event.from,
            toAgent: event.to,
            handoffReason: event.reason,
          });
          addDockerLog([{
            text: `⇢ Handoff: ${event.from.toUpperCase()} → ${event.to.toUpperCase()} (${event.reason})`,
            color: "#a78bfa",
          }]);
          return await sleep(1000, cancelRef);
        }

        case "cost_summary": {
          setActiveAgents(new Map());
          addMessage({
            id: nextId(),
            type: "cost_summary",
            tokens: event.tokens,
            toolsUsed: event.tools,
            findingsCount: event.findings,
            duration: event.duration,
            containersUsed: event.containers,
          });
          // Stop all containers
          setContainers((prev) => prev.map((c) => ({ ...c, status: "stopped" as const, cpu: 0, memory: 0 })));
          setNetworkConnections([]);
          addDockerLog([
            { text: ``, color: "#555" },
            { text: `══════ Scenario Complete ══════`, color: "#00d4ff" },
            { text: `Tokens: ${event.tokens.toLocaleString()} | Tools: ${event.tools} | Findings: ${event.findings} | Duration: ${event.duration}`, color: "#888" },
          ]);
          return true;
        }

        // ── Docker events ──

        case "docker_spawn": {
          const newContainer: DockerContainer = {
            id: event.containerId,
            name: event.containerName,
            image: event.image,
            agent: event.agent,
            status: "creating",
            cpu: 0,
            memory: 0,
          };
          setContainers((prev) => [...prev, newContainer]);

          addDockerLog([
            { text: ``, color: "#555" },
            { text: `$ docker run -d --name ${event.containerName} ${event.image}`, color: "#00d4ff" },
            { text: `Pulling image ${event.image}...`, color: "#888" },
          ]);

          addMessage({
            id: nextId(),
            type: "docker_spawn",
            agent: event.agent,
            containerId: event.containerId,
            containerName: event.containerName,
            containerImage: event.image,
          });

          await sleep(800, cancelRef);

          // Transition to running
          setContainers((prev) =>
            prev.map((c) =>
              c.id === event.containerId
                ? { ...c, status: "running", cpu: 5 + Math.random() * 15, memory: 64 + Math.random() * 60 }
                : c
            )
          );

          addDockerLog([
            { text: `Container ${event.containerId.slice(0, 12)} created. Status: running`, color: "#4ade80" },
            { text: `Network: harbinger-net | IP: 172.18.0.${2 + Math.floor(Math.random() * 50)}`, color: "#888" },
          ]);

          return await sleep(400, cancelRef);
        }

        case "docker_log": {
          addDockerLog(event.lines);
          addMessage({
            id: nextId(),
            type: "docker_log",
            containerId: event.containerId,
            dockerLogLines: event.lines,
          });
          return await sleep(300, cancelRef);
        }

        case "docker_stop": {
          setContainers((prev) =>
            prev.map((c) =>
              c.id === event.containerId ? { ...c, status: "stopped", cpu: 0, memory: 0 } : c
            )
          );
          addDockerLog([
            { text: `$ docker stop ${event.containerId.slice(0, 12)}`, color: "#f59e0b" },
            { text: `Container stopped.`, color: "#888" },
          ]);
          return await sleep(300, cancelRef);
        }

        // ── Browser events ──

        case "browser_navigate": {
          setAgentStatus(event.agent, `browsing ${event.url}`);
          setBrowserState({
            url: event.url,
            title: event.title,
            statusCode: event.statusCode,
            agentOverlay: `${event.agent.toUpperCase()} is analyzing page...`,
            actions: [],
          });
          addMessage({
            id: nextId(),
            type: "browser_navigate",
            agent: event.agent,
            browserUrl: event.url,
            browserTitle: event.title,
            browserStatusCode: event.statusCode,
          });
          addDockerLog([
            { text: `[browser] Navigating to ${event.url}`, color: "#00d4ff" },
            { text: `[browser] HTTP ${event.statusCode} | ${event.title}`, color: event.statusCode < 400 ? "#4ade80" : "#f59e0b" },
          ]);
          return await sleep(1200, cancelRef);
        }

        case "browser_action": {
          setBrowserState((prev) =>
            prev ? { ...prev, actions: [...prev.actions, event.action], agentOverlay: `${event.agent.toUpperCase()}: ${event.action.type} "${event.action.target}"` } : prev
          );
          addMessage({
            id: nextId(),
            type: "browser_action",
            agent: event.agent,
            browserAction: event.action,
          });
          addDockerLog([{
            text: `[browser] ${event.action.type}: "${event.action.target}"`,
            color: "#a78bfa",
          }]);
          return await sleep(600, cancelRef);
        }

        // ── Network events ──

        case "network_activity": {
          const conns: NetworkConnection[] = event.connections.map((c, i) => ({
            id: `net-${Date.now()}-${i}`,
            from: c.from,
            to: c.to,
            label: c.label,
            active: true,
          }));
          setNetworkConnections((prev) => [...prev, ...conns]);

          addDockerLog(
            event.connections.map((c) => ({
              text: `[net] ${c.from.toUpperCase()} → ${c.to} (${c.label})`,
              color: "#22d3ee",
            }))
          );

          await sleep(event.duration, cancelRef);

          // Deactivate connections
          setNetworkConnections((prev) =>
            prev.map((nc) => (conns.find((c) => c.id === nc.id) ? { ...nc, active: false } : nc))
          );
          return true;
        }
      }
    },
    [addMessage, setAgentStatus, addDockerLog]
  );

  const playScenario = useCallback(
    async (scenario: Scenario, userMessage?: string) => {
      cancelRef.current = false;
      setIsPlaying(true);
      setMessages([]);
      setActiveAgents(new Map());
      setContainers([]);
      setNetworkConnections([]);
      setBrowserState(null);
      setDockerLogs([
        { text: "═══ Harbinger Agent Swarm ═══", color: "#00d4ff" },
        { text: `Scenario: ${scenario.title}`, color: "#888" },
        { text: `Starting...`, color: "#4ade80" },
        { text: ``, color: "#555" },
      ]);

      if (userMessage) {
        addMessage({ id: nextId(), type: "user", text: userMessage });
        await sleep(400, cancelRef);
      }

      for (const event of scenario.events) {
        const ok = await processEvent(event);
        if (!ok) break;
      }

      setIsPlaying(false);
      setActiveAgents(new Map());
    },
    [addMessage, processEvent]
  );

  const cancel = useCallback(() => {
    cancelRef.current = true;
    setIsPlaying(false);
    setActiveAgents(new Map());
  }, []);

  const reset = useCallback(() => {
    cancelRef.current = true;
    setIsPlaying(false);
    setMessages([]);
    setActiveAgents(new Map());
    setContainers([]);
    setNetworkConnections([]);
    setBrowserState(null);
    setDockerLogs([]);
  }, []);

  return {
    messages,
    activeAgents,
    isPlaying,
    containers,
    networkConnections,
    browserState,
    dockerLogs,
    playScenario,
    cancel,
    reset,
  };
}
