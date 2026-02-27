import { getAgent } from "@/lib/demo/agents";
import type { AgentId, ToolOutputLine } from "@/lib/demo/types";
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

  return (
    <div className="flex items-start gap-3 animate-in">
      <AgentAvatar agentId={agentId} showPulse spawning={progress < 100} />
      <div className="flex flex-col gap-1.5 min-w-0 flex-1 max-w-2xl">
        <span className="text-[11px] font-mono font-medium" style={{ color: agent.color }}>
          {agent.name}
        </span>
        <div className="rounded-lg border border-white/[0.06] bg-[#0a0a10] overflow-hidden">
          {/* Terminal header */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-white/[0.04] bg-white/[0.015]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#ff5f57]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#febc2e]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#28c840]" />
            <span className="ml-1.5 text-[10px] font-mono text-[#00d4ff]">⚡ {tool}</span>
            {progress < 100 ? (
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 border border-[#00d4ff] border-t-transparent rounded-full docker-spin" />
                <span className="text-[9px] font-mono text-[#555]">{Math.round(progress)}%</span>
              </div>
            ) : (
              <span className="ml-auto text-[9px] font-mono text-[#4ade80]">✓ complete</span>
            )}
          </div>

          {/* Command + output */}
          <div ref={scrollRef} className="p-2 font-mono text-[10px] leading-[1.8] max-h-[180px] overflow-y-auto">
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
              <div key={i} className="whitespace-pre-wrap break-all" style={{ color: line.color ?? "#888" }}>
                {line.text}
              </div>
            ))}

            {/* Cursor */}
            {progress < 100 && (
              <div className="flex items-center gap-1 mt-0.5">
                <span className="inline-block w-[5px] h-[12px] bg-[#00d4ff] cursor-blink" />
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="h-[2px] bg-white/[0.04]">
            <div
              className="h-full transition-all duration-200 ease-linear"
              style={{
                width: `${progress}%`,
                backgroundColor: progress >= 100 ? "#4ade80" : agent.color,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
