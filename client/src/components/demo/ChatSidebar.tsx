import { Separator } from "@/components/ui/separator";
import { agentList } from "@/lib/demo/agents";
import type { AgentId, DockerContainer, Scenario } from "@/lib/demo/types";
import { motion, AnimatePresence } from "framer-motion";
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
}

function ContainerStatusDot({ status }: { status: DockerContainer["status"] }) {
  const color =
    status === "running"
      ? "#4ade80"
      : status === "creating"
        ? "#f59e0b"
        : "#555";
  return (
    <span className="relative inline-block shrink-0">
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {status === "running" && (
        <span
          className="absolute inset-0 w-1.5 h-1.5 rounded-full status-dot-pulse"
          style={{ backgroundColor: color }}
        />
      )}
    </span>
  );
}

export default function ChatSidebar({
  activeAgents,
  credits,
  canAfford,
  onSelectScenario,
  isPlaying,
  containers,
}: ChatSidebarProps) {
  const runningContainers = containers.filter((c) => c.status !== "stopped");

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <img
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663114013319/TAqStkfvjTyDDNXQ.png"
              alt="Harbinger"
              className="w-6 h-6 object-contain relative z-10"
            />
            {isPlaying && (
              <motion.div
                className="absolute inset-0 bg-[#00d4ff]/30 rounded-full blur-md"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>
          <div>
            <div className="text-[13px] font-display font-semibold text-white">
              Command Centre
            </div>
            <div className="text-[10px] text-[#555]">
              {isPlaying ? "Mission Active" : "Awaiting Orders"}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4">
        <CreditsDisplay remaining={credits.remaining} max={credits.max} />
      </div>

      <Separator className="my-3 bg-white/[0.06]" />

      {/* Active Agents */}
      <div className="px-4">
        <div className="text-[10px] font-mono text-[#555] uppercase tracking-wider mb-2">
          Agent Roster
          {activeAgents.size > 0 && (
            <span className="ml-1.5 text-[#4ade80]">
              ({activeAgents.size} active)
            </span>
          )}
        </div>
        <div className="space-y-0.5">
          {agentList.map((agent) => {
            const status = activeAgents.get(agent.id);
            const isActive = !!status;
            return (
              <motion.div
                key={agent.id}
                animate={{
                  opacity: isActive ? 1 : 0.4,
                  x: isActive ? 0 : -2,
                }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 py-1 px-1 rounded"
              >
                <AgentAvatar
                  agentId={agent.id}
                  size="sm"
                  showPulse={isActive}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[10px] font-mono font-medium truncate"
                      style={{ color: isActive ? agent.color : "#666" }}
                    >
                      {agent.name}
                    </span>
                  </div>
                  {isActive ? (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[8px] text-[#555] truncate block"
                    >
                      {status}
                    </motion.span>
                  ) : (
                    <span className="text-[8px] text-[#333] truncate block">
                      {agent.role}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <Separator className="my-3 bg-white/[0.06]" />

      {/* Docker Containers */}
      <AnimatePresence>
        {containers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="px-4">
              <div className="text-[10px] font-mono text-[#555] uppercase tracking-wider mb-2">
                Docker Containers
                {runningContainers.length > 0 && (
                  <span className="ml-1 text-[#4ade80]">
                    ({runningContainers.length} running)
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <AnimatePresence>
                  {containers.map((c) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-center gap-2 px-2 py-1 rounded bg-white/[0.02] border border-white/[0.04]"
                    >
                      <ContainerStatusDot status={c.status} />
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-mono text-[#999] truncate">
                          {c.name}
                        </div>
                        <div className="text-[8px] text-[#444] truncate">
                          {c.image}
                        </div>
                      </div>
                      {c.status === "running" && (
                        <div className="text-right shrink-0">
                          <div className="text-[8px] font-mono text-[#00d4ff]">
                            {Math.round(c.cpu)}% CPU
                          </div>
                          <div className="text-[8px] font-mono text-[#555]">
                            {Math.round(c.memory)}MB
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
            <Separator className="my-3 bg-white/[0.06]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scenario Presets */}
      <div className="px-4 pb-4">
        <div className="text-[10px] font-mono text-[#555] uppercase tracking-wider mb-2">
          Scenarios
        </div>
        <ScenarioPresets
          onSelect={onSelectScenario}
          disabled={isPlaying}
          canAfford={canAfford}
          compact
        />
      </div>
    </div>
  );
}
