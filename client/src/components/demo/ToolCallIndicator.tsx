import { getAgent } from "@/lib/demo/agents";
import type { AgentId } from "@/lib/demo/types";
import AgentAvatar from "./AgentAvatar";

interface ToolCallIndicatorProps {
  agentId: AgentId;
  tool: string;
  command: string;
  progress: number;
}

export default function ToolCallIndicator({ agentId, tool, command, progress }: ToolCallIndicatorProps) {
  const agent = getAgent(agentId);

  return (
    <div className="flex items-start gap-3 animate-in">
      <AgentAvatar agentId={agentId} showPulse />
      <div className="flex flex-col gap-1.5 min-w-0 flex-1 max-w-lg">
        <span className="text-[11px] font-mono font-medium" style={{ color: agent.color }}>
          {agent.name}
        </span>
        <div className="rounded-lg border border-white/[0.06] bg-[#0c0c12] overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.04]">
            <span className="text-[11px] font-mono text-[#00d4ff]">⚡ {tool}</span>
            {progress < 100 && (
              <span className="text-[10px] font-mono text-[#555]">{Math.round(progress)}%</span>
            )}
            {progress >= 100 && (
              <span className="text-[10px] font-mono text-[#4ade80]">✓ done</span>
            )}
          </div>
          <div className="px-3 py-2">
            <code className="text-[11px] font-mono text-[#888] break-all">$ {command}</code>
          </div>
          {/* Progress bar */}
          <div className="h-0.5 bg-white/[0.04]">
            <div
              className="h-full transition-all duration-150 ease-linear"
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
