import { getAgent } from "@/lib/demo/agents";
import type { ChatMsg } from "@/lib/demo/types";
import AgentAvatar from "./AgentAvatar";
import AgentHandoffBadge from "./AgentHandoffBadge";
import FindingCard from "./FindingCard";
import ThinkingIndicator from "./ThinkingIndicator";
import ToolCallIndicator from "./ToolCallIndicator";

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

function CostSummary({ msg }: { msg: ChatMsg }) {
  return (
    <div className="flex items-center justify-center py-3 animate-in">
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 px-4 py-2 rounded-lg border border-white/[0.06] bg-white/[0.02]">
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
        <ToolCallIndicator
          agentId={msg.agent}
          tool={msg.tool ?? ""}
          command={msg.command ?? ""}
          progress={msg.toolProgress ?? 0}
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
    default:
      return null;
  }
}
