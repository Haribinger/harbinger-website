import { getAgent } from "@/lib/demo/agents";
import type { AgentId } from "@/lib/demo/types";
import AgentAvatar from "./AgentAvatar";

export default function ThinkingIndicator({ agentId }: { agentId: AgentId }) {
  const agent = getAgent(agentId);

  return (
    <div className="flex items-start gap-3 animate-in">
      <AgentAvatar agentId={agentId} showPulse />
      <div className="flex flex-col gap-1 min-w-0">
        <span className="text-[11px] font-mono font-medium" style={{ color: agent.color }}>
          {agent.name}
        </span>
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/[0.06] bg-[#0c0c12]">
          <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-[#555]" style={{ animationDelay: "0ms" }} />
          <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-[#555]" style={{ animationDelay: "200ms" }} />
          <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-[#555]" style={{ animationDelay: "400ms" }} />
        </div>
      </div>
    </div>
  );
}
