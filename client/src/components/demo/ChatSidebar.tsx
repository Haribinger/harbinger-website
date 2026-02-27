import { Separator } from "@/components/ui/separator";
import { agentList } from "@/lib/demo/agents";
import type { AgentId, DockerContainer, Scenario } from "@/lib/demo/types";
import AgentAvatar from "./AgentAvatar";
import CreditsDisplay from "./CreditsDisplay";
import ScenarioPresets from "./ScenarioPresets";

interface ChatSidebarProps {
  activeAgents: Map<AgentId, string>;
  credits: { remaining: number; max: number };
  canAfford: (cost: number) => boolean;
  onSelectScenario: (scenario: Scenario) => void;
  isPlaying: boolean;
  containers: DockerContainer[];
  activePanel: string;
  onPanelChange: (panel: string) => void;
}

function ContainerStatusDot({ status }: { status: DockerContainer["status"] }) {
  const color =
    status === "running" ? "#4ade80" : status === "creating" ? "#f59e0b" : "#555";
  return (
    <span
      className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${status === "running" ? "animate-pulse" : ""}`}
      style={{ backgroundColor: color }}
    />
  );
}

export default function ChatSidebar({
  activeAgents,
  credits,
  canAfford,
  onSelectScenario,
  isPlaying,
  containers,
  activePanel,
  onPanelChange,
}: ChatSidebarProps) {
  const runningContainers = containers.filter((c) => c.status !== "stopped");

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center gap-2">
          <img
            src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663114013319/TAqStkfvjTyDDNXQ.png"
            alt="Harbinger"
            className="w-6 h-6 object-contain"
          />
          <div>
            <div className="text-[13px] font-display font-semibold text-white">Interactive Demo</div>
            <div className="text-[10px] text-[#555]">Full System Visualisation</div>
          </div>
        </div>
      </div>

      <div className="px-4">
        <CreditsDisplay remaining={credits.remaining} max={credits.max} />
      </div>

      <Separator className="my-3 bg-white/[0.06]" />

      {/* View Panels */}
      <div className="px-4">
        <div className="text-[10px] font-mono text-[#555] uppercase tracking-wider mb-2">Panels</div>
        <div className="grid grid-cols-2 gap-1">
          {[
            { id: "chat", label: "Chat", icon: "💬" },
            { id: "docker", label: "Docker", icon: "🐳" },
            { id: "browser", label: "Browser", icon: "🌐" },
            { id: "network", label: "Network", icon: "🔗" },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => onPanelChange(p.id)}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-[10px] font-mono transition-colors ${
                activePanel === p.id
                  ? "bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20"
                  : "text-[#666] hover:text-[#999] border border-transparent hover:bg-white/[0.02]"
              }`}
            >
              <span className="text-xs">{p.icon}</span>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <Separator className="my-3 bg-white/[0.06]" />

      {/* Active Agents */}
      {activeAgents.size > 0 && (
        <>
          <div className="px-4">
            <div className="text-[10px] font-mono text-[#555] uppercase tracking-wider mb-2">Active Agents</div>
            <div className="space-y-1.5">
              {Array.from(activeAgents.entries()).map(([agentId, status]) => (
                <div key={agentId} className="flex items-center gap-2">
                  <AgentAvatar agentId={agentId} size="sm" showPulse />
                  <div className="min-w-0">
                    <div className="text-[11px] font-mono text-white truncate">
                      {agentList.find((a) => a.id === agentId)?.name}
                    </div>
                    <div className="text-[9px] text-[#555] truncate">{status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Separator className="my-3 bg-white/[0.06]" />
        </>
      )}

      {/* Docker Containers */}
      {containers.length > 0 && (
        <>
          <div className="px-4">
            <div className="text-[10px] font-mono text-[#555] uppercase tracking-wider mb-2">
              Docker Containers
              {runningContainers.length > 0 && (
                <span className="ml-1 text-[#4ade80]">({runningContainers.length} running)</span>
              )}
            </div>
            <div className="space-y-1">
              {containers.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-2 px-2 py-1 rounded bg-white/[0.02] border border-white/[0.04]"
                >
                  <ContainerStatusDot status={c.status} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-mono text-[#999] truncate">{c.name}</div>
                    <div className="text-[8px] text-[#444] truncate">{c.image}</div>
                  </div>
                  {c.status === "running" && (
                    <div className="text-right shrink-0">
                      <div className="text-[8px] font-mono text-[#00d4ff]">{Math.round(c.cpu)}% CPU</div>
                      <div className="text-[8px] font-mono text-[#555]">{Math.round(c.memory)}MB</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <Separator className="my-3 bg-white/[0.06]" />
        </>
      )}

      {/* Scenario Presets */}
      <div className="px-4">
        <div className="text-[10px] font-mono text-[#555] uppercase tracking-wider mb-2">Scenarios</div>
        <ScenarioPresets
          onSelect={onSelectScenario}
          disabled={isPlaying}
          canAfford={canAfford}
          compact
        />
      </div>

      <Separator className="my-3 bg-white/[0.06]" />

      {/* All Agents */}
      <div className="px-4 pb-4 flex-1">
        <div className="text-[10px] font-mono text-[#555] uppercase tracking-wider mb-2">All 11 Agents</div>
        <div className="space-y-1">
          {agentList.map((agent) => {
            const isActive = activeAgents.has(agent.id);
            return (
              <div
                key={agent.id}
                className="flex items-center gap-2 py-1 px-1 rounded"
                style={{ opacity: isActive ? 1 : 0.5 }}
              >
                <span className="text-xs">{agent.icon}</span>
                <span className="text-[11px] font-mono text-[#999] truncate">{agent.name}</span>
                <span className="text-[9px] text-[#444] truncate ml-auto">{agent.role}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
