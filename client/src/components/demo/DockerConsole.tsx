import { ScrollArea } from "@/components/ui/scroll-area";
import type { DockerContainer, ToolOutputLine } from "@/lib/demo/types";
import { useEffect, useRef } from "react";

interface DockerConsoleProps {
  logs: ToolOutputLine[];
  containers: DockerContainer[];
  collapsed?: boolean;
}

function ContainerStatusDot({ status }: { status: DockerContainer["status"] }) {
  const color =
    status === "running" ? "#4ade80" : status === "creating" ? "#f59e0b" : "#555";
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full shrink-0 ${status === "running" ? "animate-pulse" : ""}`}
      style={{ backgroundColor: color }}
    />
  );
}

function ResourceBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="h-1 w-12 rounded-full bg-white/[0.06] overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

export default function DockerConsole({ logs, containers, collapsed }: DockerConsoleProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs.length]);

  if (collapsed) return null;

  const activeContainers = containers.filter((c) => c.status !== "stopped");

  return (
    <div className="flex flex-col rounded-lg border border-white/[0.06] bg-[#08080d] overflow-hidden">
      {/* Terminal header */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.02] border-b border-white/[0.04] shrink-0">
        <div className="w-2 h-2 rounded-full bg-[#ff5f57]" />
        <div className="w-2 h-2 rounded-full bg-[#febc2e]" />
        <div className="w-2 h-2 rounded-full bg-[#28c840]" />
        <span className="ml-2 text-[10px] font-mono text-[#444]">
          🐳 docker — harbinger-swarm
        </span>
        {activeContainers.length > 0 && (
          <span className="ml-auto text-[9px] font-mono text-[#4ade80]">
            {activeContainers.length} running
          </span>
        )}
      </div>

      {/* Container status bar */}
      {containers.length > 0 && (
        <div className="flex flex-wrap gap-2 px-3 py-1.5 border-b border-white/[0.04] bg-white/[0.01]">
          {containers.map((c) => (
            <div key={c.id} className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.04]">
              <ContainerStatusDot status={c.status} />
              <span className="text-[9px] font-mono text-[#999] max-w-[100px] truncate">{c.name}</span>
              {c.status === "running" && (
                <>
                  <ResourceBar value={c.cpu} max={100} color="#00d4ff" />
                  <span className="text-[8px] font-mono text-[#555]">{Math.round(c.cpu)}%</span>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Log output */}
      <ScrollArea className="h-[200px]">
        <div className="p-2 font-mono text-[10px] leading-[1.8]">
          {logs.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap break-all" style={{ color: line.color ?? "#888" }}>
              {line.text || "\u00A0"}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  );
}
