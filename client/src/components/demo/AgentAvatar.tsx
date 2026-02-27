import { getAgent } from "@/lib/demo/agents";
import type { AgentId } from "@/lib/demo/types";

interface AgentAvatarProps {
  agentId: AgentId;
  size?: "sm" | "md";
  showPulse?: boolean;
}

export default function AgentAvatar({ agentId, size = "md", showPulse }: AgentAvatarProps) {
  const agent = getAgent(agentId);
  const dim = size === "sm" ? "w-6 h-6 text-xs" : "w-8 h-8 text-sm";

  return (
    <div className="relative shrink-0">
      <div
        className={`${dim} rounded-full flex items-center justify-center font-mono font-bold`}
        style={{ backgroundColor: agent.color + "18", border: `1px solid ${agent.color}33` }}
      >
        <span>{agent.icon}</span>
      </div>
      {showPulse && (
        <span
          className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full animate-pulse"
          style={{ backgroundColor: agent.color }}
        />
      )}
    </div>
  );
}
