import { getAgent } from "@/lib/demo/agents";
import type { AgentId } from "@/lib/demo/types";

interface AgentAvatarProps {
  agentId: AgentId;
  size?: "sm" | "md";
  showPulse?: boolean;
  spawning?: boolean;
}

export default function AgentAvatar({ agentId, size = "md", showPulse, spawning }: AgentAvatarProps) {
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
      {spawning && (
        <span className="absolute -bottom-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-[#0a0a0f] border border-white/[0.1]">
          <span className="text-[8px] docker-spin inline-block">🐳</span>
        </span>
      )}
    </div>
  );
}
