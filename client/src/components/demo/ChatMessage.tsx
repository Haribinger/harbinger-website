import { getAgent } from "@/lib/demo/agents";
import type { ChatMsg } from "@/lib/demo/types";
import AgentAvatar from "./AgentAvatar";
import AgentHandoffBadge from "./AgentHandoffBadge";
import FindingCard from "./FindingCard";
import ThinkingIndicator from "./ThinkingIndicator";
import ToolTerminal from "./ToolTerminal";

function ToolResultMessage({ msg }: { msg: ChatMsg }) {
  const statusColor =
    msg.toolStatus === "success" ? "#4ade80" : msg.toolStatus === "warning" ? "#f59e0b" : "#ef4444";
  const statusIcon = msg.toolStatus === "success" ? "✓" : msg.toolStatus === "warning" ? "⚠" : "✗";

  return (
    <div className="flex items-start gap-3 animate-in ml-11">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.06] bg-[#0c0c12]">
        <span className="text-[11px] font-mono" style={{ color: statusColor }}>
          {statusIcon}
        </span>
        <span className="text-[11px] font-mono text-[#999]">{msg.text}</span>
      </div>
    </div>
  );
}

function AgentTextMessage({ msg }: { msg: ChatMsg }) {
  const agent = msg.agent ? getAgent(msg.agent) : null;

  return (
    <div className="flex items-start gap-3 animate-in">
      {msg.agent && <AgentAvatar agentId={msg.agent} />}
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        {agent && (
          <span className="text-[11px] font-mono font-medium" style={{ color: agent.color }}>
            {agent.name}
          </span>
        )}
        <div className="text-[13px] text-[#ccc] leading-[1.7] whitespace-pre-wrap break-words demo-markdown">
          {msg.text}
          {msg.isStreaming && (
            <span className="inline-block w-[5px] h-[14px] bg-[#00d4ff] cursor-blink ml-0.5 align-middle" />
          )}
        </div>
      </div>
    </div>
  );
}

function UserMessage({ msg }: { msg: ChatMsg }) {
  return (
    <div className="flex items-start gap-3 justify-end animate-in">
      <div className="px-4 py-2.5 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 max-w-[80%]">
        <p className="text-[13px] text-[#00d4ff] leading-[1.6]">{msg.text}</p>
      </div>
    </div>
  );
}

function DockerSpawnMessage({ msg }: { msg: ChatMsg }) {
  const agent = msg.agent ? getAgent(msg.agent) : null;

  return (
    <div className="flex items-center gap-3 animate-in ml-11">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#00d4ff]/15 bg-[#00d4ff]/[0.04]">
        <span className="text-sm docker-spin inline-block">🐳</span>
        <div className="flex flex-col">
          <span className="text-[10px] font-mono text-[#00d4ff]">
            Container spawned for {agent?.name ?? msg.agent}
          </span>
          <span className="text-[9px] font-mono text-[#555]">
            {msg.containerName} • {msg.containerImage}
          </span>
        </div>
      </div>
    </div>
  );
}

function BrowserNavigateMessage({ msg }: { msg: ChatMsg }) {
  return (
    <div className="flex items-center gap-3 animate-in ml-11">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#a78bfa]/15 bg-[#a78bfa]/[0.04]">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-[#a78bfa] shrink-0">
          <path d="M8 1a7 7 0 110 14A7 7 0 018 1z" stroke="currentColor" strokeWidth="1.2" />
          <path d="M1 8h14" stroke="currentColor" strokeWidth="1" />
        </svg>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-mono text-[#a78bfa] truncate">
            {msg.browserUrl}
          </span>
          <span className="text-[9px] text-[#555]">
            HTTP {msg.browserStatusCode} • {msg.browserTitle}
          </span>
        </div>
      </div>
    </div>
  );
}

function BrowserActionMessage({ msg }: { msg: ChatMsg }) {
  if (!msg.browserAction) return null;
  return (
    <div className="flex items-center gap-3 animate-in ml-11">
      <div className="flex items-center gap-2 px-2.5 py-1 rounded border border-[#a78bfa]/10 bg-[#a78bfa]/[0.03]">
        <span className="text-[9px] font-mono text-[#a78bfa]">
          🖱 {msg.browserAction.type}: "{msg.browserAction.target}"
        </span>
      </div>
    </div>
  );
}

function CostSummary({ msg }: { msg: ChatMsg }) {
  return (
    <div className="flex items-center justify-center py-3 animate-in">
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 px-4 py-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-[#555]">Tokens</span>
          <span className="text-[11px] font-mono text-white">{msg.tokens?.toLocaleString()}</span>
        </div>
        <div className="w-px h-3 bg-white/[0.08]" />
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-[#555]">Tools</span>
          <span className="text-[11px] font-mono text-white">{msg.toolsUsed}</span>
        </div>
        <div className="w-px h-3 bg-white/[0.08]" />
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-[#555]">Findings</span>
          <span className="text-[11px] font-mono text-[#ef4444]">{msg.findingsCount}</span>
        </div>
        <div className="w-px h-3 bg-white/[0.08]" />
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-[#555]">Containers</span>
          <span className="text-[11px] font-mono text-[#00d4ff]">{msg.containersUsed ?? 0}</span>
        </div>
        <div className="w-px h-3 bg-white/[0.08]" />
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-[#555]">Duration</span>
          <span className="text-[11px] font-mono text-white">{msg.duration}</span>
        </div>
      </div>
    </div>
  );
}

export default function ChatMessage({ msg }: { msg: ChatMsg }) {
  switch (msg.type) {
    case "user":
      return <UserMessage msg={msg} />;
    case "thinking":
      return msg.agent ? <ThinkingIndicator agentId={msg.agent} /> : null;
    case "agent_message":
      return <AgentTextMessage msg={msg} />;
    case "tool_call":
      return msg.agent ? (
        <ToolTerminal
          agentId={msg.agent}
          tool={msg.tool ?? ""}
          command={msg.command ?? ""}
          progress={msg.toolProgress ?? 0}
          outputLines={msg.toolOutputLines}
          outputIndex={msg.toolOutputIndex}
        />
      ) : null;
    case "tool_result":
      return <ToolResultMessage msg={msg} />;
    case "finding":
      return msg.finding ? <FindingCard finding={msg.finding} /> : null;
    case "handoff":
      return msg.fromAgent && msg.toAgent ? (
        <AgentHandoffBadge from={msg.fromAgent} to={msg.toAgent} reason={msg.handoffReason ?? ""} />
      ) : null;
    case "cost_summary":
      return <CostSummary msg={msg} />;
    case "docker_spawn":
      return <DockerSpawnMessage msg={msg} />;
    case "docker_log":
      return null; // Docker logs shown in DockerConsole panel, not inline
    case "browser_navigate":
      return <BrowserNavigateMessage msg={msg} />;
    case "browser_action":
      return <BrowserActionMessage msg={msg} />;
    default:
      return null;
  }
}
