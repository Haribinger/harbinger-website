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
    <div className="flex flex-col items-center gap-1 py-3 animate-in">
      <div className="flex items-center gap-0 px-1 py-1 rounded-full border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        {/* From agent */}
        <div className="flex items-center gap-1.5 px-2.5 py-0.5">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
            style={{ backgroundColor: fromAgent.color + "20", border: `1px solid ${fromAgent.color}30` }}
          >
            {fromAgent.icon}
          </div>
          <span className="text-[11px] font-mono font-medium" style={{ color: fromAgent.color }}>
            {fromAgent.name}
          </span>
        </div>

        {/* Animated arrow */}
        <div className="relative w-16 h-5 mx-1 overflow-hidden">
          {/* Track line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/[0.1]" />
          {/* Arrow */}
          <svg width="12" height="12" viewBox="0 0 12 12" className="absolute right-0 top-1/2 -translate-y-1/2 text-[#00d4ff]">
            <path d="M1 6h10M8 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          {/* Animated packet */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full handoff-packet"
            style={{
              background: `linear-gradient(90deg, ${fromAgent.color}, ${toAgent.color})`,
              boxShadow: `0 0 6px ${fromAgent.color}60`,
            }}
          />
        </div>

        {/* To agent */}
        <div className="flex items-center gap-1.5 px-2.5 py-0.5">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
            style={{ backgroundColor: toAgent.color + "20", border: `1px solid ${toAgent.color}30` }}
          >
            {toAgent.icon}
          </div>
          <span className="text-[11px] font-mono font-medium" style={{ color: toAgent.color }}>
            {toAgent.name}
          </span>
        </div>
      </div>
      <span className="text-[9px] text-[#555] max-w-xs text-center">{reason}</span>
    </div>
  );
}
