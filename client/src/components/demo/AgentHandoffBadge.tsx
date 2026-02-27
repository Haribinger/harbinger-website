import { getAgent } from "@/lib/demo/agents";
import type { AgentId } from "@/lib/demo/types";

interface AgentHandoffBadgeProps {
  from: AgentId;
  to: AgentId;
  reason: string;
}

export default function AgentHandoffBadge({ from, to, reason }: AgentHandoffBadgeProps) {
  const fromAgent = getAgent(from);
  const toAgent = getAgent(to);

  return (
    <div className="flex items-center justify-center py-3 animate-in">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02]">
        <span className="text-[11px] font-mono font-medium" style={{ color: fromAgent.color }}>
          {fromAgent.icon} {fromAgent.name}
        </span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[#555]">
          <path d="M3 8h10m0 0L9.5 4.5M13 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-[11px] font-mono font-medium" style={{ color: toAgent.color }}>
          {toAgent.icon} {toAgent.name}
        </span>
      </div>
      <span className="ml-2 text-[10px] text-[#555] hidden sm:inline">{reason}</span>
    </div>
  );
}
