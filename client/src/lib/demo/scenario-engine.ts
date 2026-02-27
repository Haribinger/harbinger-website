import { useCallback, useRef, useState } from "react";
import type { AgentId, ChatMsg, Scenario, ScenarioEvent } from "./types";

let msgIdCounter = 0;
function nextId(): string {
  return `msg-${++msgIdCounter}`;
}

function sleep(ms: number, cancel: React.RefObject<boolean>): Promise<boolean> {
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve(!cancel.current), ms);
    // Check cancel periodically for responsiveness
    const check = setInterval(() => {
      if (cancel.current) {
        clearTimeout(t);
        clearInterval(check);
        resolve(false);
      }
    }, 50);
    // Clean up interval when timeout fires normally
    setTimeout(() => clearInterval(check), ms + 10);
  });
}

export function useScenarioEngine() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [activeAgents, setActiveAgents] = useState<Map<AgentId, string>>(new Map());
  const [isPlaying, setIsPlaying] = useState(false);
  const cancelRef = useRef(false);

  const addMessage = useCallback((msg: ChatMsg) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const updateLastMessage = useCallback((updater: (msg: ChatMsg) => ChatMsg) => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const copy = [...prev];
      copy[copy.length - 1] = updater(copy[copy.length - 1]);
      return copy;
    });
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
          // Remove thinking message
          setMessages((prev) => prev.filter((m) => m.id !== id));
          return true;
        }

        case "agent_message": {
          setAgentStatus(event.agent, "responding");
          const id = nextId();
          const charDelay = event.charDelay ?? 20;
          addMessage({ id, type: "agent_message", agent: event.agent, text: "", isStreaming: true });

          // Stream char by char
          for (let i = 0; i < event.text.length; i++) {
            if (cancelRef.current) return false;
            const partial = event.text.slice(0, i + 1);
            setMessages((prev) =>
              prev.map((m) => (m.id === id ? { ...m, text: partial } : m))
            );
            // Faster for whitespace/punctuation, slower for content
            const char = event.text[i];
            const delay = /[\s,.]/.test(char) ? Math.max(5, charDelay * 0.3) : charDelay;
            await new Promise((r) => setTimeout(r, delay));
          }

          // Mark streaming done
          setMessages((prev) =>
            prev.map((m) => (m.id === id ? { ...m, isStreaming: false } : m))
          );
          setAgentStatus(event.agent, "idle");
          return true;
        }

        case "tool_call": {
          setAgentStatus(event.agent, `running ${event.tool}`);
          const id = nextId();
          addMessage({
            id,
            type: "tool_call",
            agent: event.agent,
            tool: event.tool,
            command: event.command,
            toolProgress: 0,
            toolDuration: event.duration,
          });

          // Animate progress bar
          const steps = 20;
          const stepTime = event.duration / steps;
          for (let i = 1; i <= steps; i++) {
            if (cancelRef.current) return false;
            const progress = Math.min(100, (i / steps) * 100);
            setMessages((prev) =>
              prev.map((m) => (m.id === id ? { ...m, toolProgress: progress } : m))
            );
            await new Promise((r) => setTimeout(r, stepTime));
          }
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
          const ok = await sleep(500, cancelRef);
          return ok;
        }

        case "finding": {
          addMessage({
            id: nextId(),
            type: "finding",
            agent: event.agent,
            finding: event.finding,
          });
          const ok = await sleep(800, cancelRef);
          return ok;
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
          const ok = await sleep(1000, cancelRef);
          return ok;
        }

        case "cost_summary": {
          // Clear all active agents
          setActiveAgents(new Map());
          addMessage({
            id: nextId(),
            type: "cost_summary",
            tokens: event.tokens,
            toolsUsed: event.tools,
            findingsCount: event.findings,
            duration: event.duration,
          });
          return true;
        }
      }
    },
    [addMessage, setAgentStatus]
  );

  const playScenario = useCallback(
    async (scenario: Scenario, userMessage?: string) => {
      cancelRef.current = false;
      setIsPlaying(true);
      setMessages([]);
      setActiveAgents(new Map());

      // Add user message if provided
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
  }, []);

  return { messages, activeAgents, isPlaying, playScenario, cancel, reset };
}
