import { getAgent } from "@/lib/demo/agents";
import type { AgentId } from "@/lib/demo/types";
import { motion } from "framer-motion";
import AgentAvatar from "./AgentAvatar";

export default function ThinkingIndicator({
  agentId,
}: {
  agentId: AgentId;
}) {
  const agent = getAgent(agentId);

  return (
    <div className="flex items-start gap-3">
      <AgentAvatar agentId={agentId} showPulse />
      <div className="flex flex-col gap-1 min-w-0">
        <span
          className="text-[11px] font-mono font-medium"
          style={{ color: agent.color }}
        >
          {agent.name}
        </span>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/[0.06] bg-[#0c0c12]"
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: agent.color }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
          <span className="text-[9px] font-mono text-[#444] ml-1">
            analyzing...
          </span>
        </motion.div>
      </div>
    </div>
  );
}
