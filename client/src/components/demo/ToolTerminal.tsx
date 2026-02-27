import { getAgent } from "@/lib/demo/agents";
import type { AgentId, ToolOutputLine } from "@/lib/demo/types";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import AgentAvatar from "./AgentAvatar";

interface ToolTerminalProps {
  agentId: AgentId;
  tool: string;
  command: string;
  progress: number;
  outputLines?: ToolOutputLine[];
  outputIndex?: number;
}

export default function ToolTerminal({
  agentId,
  tool,
  command,
  progress,
  outputLines = [],
  outputIndex = 0,
}: ToolTerminalProps) {
  const agent = getAgent(agentId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const visibleLines = outputLines.slice(0, outputIndex);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [outputIndex]);

  const isComplete = progress >= 100;

  return (
    <div className="flex items-start gap-3">
      <AgentAvatar
        agentId={agentId}
        showPulse={!isComplete}
        spawning={!isComplete}
      />
      <div className="flex flex-col gap-1.5 min-w-0 flex-1 max-w-2xl">
        <span
          className="text-[11px] font-mono font-medium"
          style={{ color: agent.color }}
        >
          {agent.name}
        </span>
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-lg border border-white/[0.06] bg-[#0a0a10] overflow-hidden"
          style={{
            boxShadow: isComplete
              ? "none"
              : `0 0 12px ${agent.color}10, inset 0 1px 0 ${agent.color}08`,
          }}
        >
          {/* Terminal header */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-white/[0.04] bg-white/[0.015]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#ff5f57]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#febc2e]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#28c840]" />
            <span
              className="ml-1.5 text-[10px] font-mono"
              style={{ color: agent.color }}
            >
              ⚡ {tool}
            </span>
            {!isComplete ? (
              <div className="ml-auto flex items-center gap-1.5">
                <motion.div
                  className="w-2.5 h-2.5 rounded-full border-[1.5px] border-t-transparent"
                  style={{ borderColor: agent.color }}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <span className="text-[9px] font-mono text-[#555]">
                  {Math.round(progress)}%
                </span>
              </div>
            ) : (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="ml-auto text-[9px] font-mono text-[#4ade80]"
              >
                ✓ complete
              </motion.span>
            )}
          </div>

          {/* Command + output */}
          <div
            ref={scrollRef}
            className="p-2 font-mono text-[10px] leading-[1.8] max-h-[180px] overflow-y-auto"
          >
            {/* Command prompt */}
            <div className="flex items-center gap-1">
              <span className="text-[#4ade80]">harbinger</span>
              <span className="text-[#555]">:</span>
              <span className="text-[#00d4ff]">~</span>
              <span className="text-[#555]">$</span>
              <span className="text-[#ccc] ml-1">{command}</span>
            </div>

            {/* Streaming output */}
            {visibleLines.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1 }}
                className="whitespace-pre-wrap break-all"
                style={{ color: line.color ?? "#888" }}
              >
                {line.text}
              </motion.div>
            ))}

            {/* Cursor */}
            {!isComplete && (
              <div className="flex items-center gap-1 mt-0.5">
                <span className="inline-block w-[5px] h-[12px] bg-[#00d4ff] terminal-cursor" />
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="h-[2px] bg-white/[0.04] relative overflow-hidden">
            <motion.div
              className="h-full"
              style={{
                width: `${progress}%`,
                backgroundColor: isComplete ? "#4ade80" : agent.color,
              }}
              transition={{ duration: 0.2, ease: "linear" }}
            />
            {!isComplete && (
              <div
                className="absolute inset-0 progress-shimmer"
                style={{ width: `${progress}%` }}
              />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
