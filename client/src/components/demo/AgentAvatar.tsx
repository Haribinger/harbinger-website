import { getAgent } from "@/lib/demo/agents";
import type { AgentId } from "@/lib/demo/types";
import { motion } from "framer-motion";

interface AgentAvatarProps {
  agentId: AgentId;
  size?: "sm" | "md";
  showPulse?: boolean;
  spawning?: boolean;
}

export default function AgentAvatar({
  agentId,
  size = "md",
  showPulse,
  spawning,
}: AgentAvatarProps) {
  const agent = getAgent(agentId);
  const dim = size === "sm" ? "w-6 h-6 text-xs" : "w-8 h-8 text-sm";

  return (
    <div className="relative shrink-0">
      {/* Glow ring for active agents */}
      {showPulse && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            ["--agent-color" as string]: agent.color,
            boxShadow: `0 0 8px ${agent.color}40, 0 0 16px ${agent.color}20`,
          }}
          animate={{
            boxShadow: [
              `0 0 4px ${agent.color}30, 0 0 8px ${agent.color}15`,
              `0 0 10px ${agent.color}50, 0 0 20px ${agent.color}30`,
              `0 0 4px ${agent.color}30, 0 0 8px ${agent.color}15`,
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <div
        className={`${dim} rounded-full flex items-center justify-center font-mono font-bold relative z-10`}
        style={{
          backgroundColor: agent.color + "18",
          border: `1.5px solid ${agent.color}${showPulse ? "55" : "33"}`,
        }}
      >
        <span>{agent.icon}</span>
      </div>
      {showPulse && (
        <motion.span
          className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full z-20"
          style={{ backgroundColor: agent.color }}
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
      {spawning && (
        <span className="absolute -bottom-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-[#0a0a0f] border border-white/[0.1] z-20">
          <span className="text-[8px] docker-spin inline-block">🐳</span>
        </span>
      )}
    </div>
  );
}
