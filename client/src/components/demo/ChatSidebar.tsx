import { Separator } from "@/components/ui/separator";
import { agentList } from "@/lib/demo/agents";
import type { AgentId, Scenario } from "@/lib/demo/types";
import AgentAvatar from "./AgentAvatar";
import CreditsDisplay from "./CreditsDisplay";
import ScenarioPresets from "./ScenarioPresets";

interface ChatSidebarProps {
  activeAgents: Map<AgentId, string>;
  credits: { remaining: number; max: number };
  canAfford: (cost: number) => boolean;
  onSelectScenario: (scenario: Scenario) => void;
  isPlaying: boolean;
}

export default function ChatSidebar({
  activeAgents,
  credits,
  canAfford,
  onSelectScenario,
  isPlaying,
}: ChatSidebarProps) {
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
            <div className="text-[10px] text-[#555]">Simulated Agent Swarm</div>
          </div>
        </div>
      </div>

      <div className="px-4">
        <CreditsDisplay remaining={credits.remaining} max={credits.max} />
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
