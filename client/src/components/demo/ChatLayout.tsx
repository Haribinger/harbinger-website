import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/useMobile";
import { useCredits } from "@/lib/demo/credits";
import { hydrateScenario, matchScenario } from "@/lib/demo/scenarios";
import { useScenarioEngine } from "@/lib/demo/scenario-engine";
import type { Scenario } from "@/lib/demo/types";
import { ChevronDown, ChevronUp, Menu } from "lucide-react";
import { useCallback, useState } from "react";
import BrowserView from "./BrowserView";
import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";
import ChatSidebar from "./ChatSidebar";
import CreditsExhaustedDialog from "./CreditsExhaustedDialog";
import DockerConsole from "./DockerConsole";
import NetworkGraph from "./NetworkGraph";
import ScenarioPresets from "./ScenarioPresets";

export default function ChatLayout() {
  const isMobile = useIsMobile();
  const { remaining, max, spend, canAfford } = useCredits();
  const {
    messages,
    activeAgents,
    isPlaying,
    containers,
    networkConnections,
    browserState,
    dockerLogs,
    playScenario,
    cancel,
  } = useScenarioEngine();
  const [exhaustedOpen, setExhaustedOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePanel, setActivePanel] = useState("chat");
  const [bottomPanelCollapsed, setBottomPanelCollapsed] = useState(false);

  const runScenario = useCallback(
    (scenario: Scenario, userMessage?: string, target?: string) => {
      if (!canAfford(scenario.cost)) {
        setExhaustedOpen(true);
        return;
      }
      const ok = spend(scenario.cost);
      if (!ok) {
        setExhaustedOpen(true);
        return;
      }
      const t = target ?? "example.com";
      const hydrated = hydrateScenario(scenario, t);
      setSidebarOpen(false);
      setBottomPanelCollapsed(false);
      playScenario(hydrated, userMessage);
    },
    [canAfford, spend, playScenario]
  );

  const handlePresetSelect = useCallback(
    (scenario: Scenario) => {
      runScenario(scenario, scenario.title, "example.com");
    },
    [runScenario]
  );

  const handleFreeText = useCallback(
    (text: string) => {
      const { scenario, target } = matchScenario(text);
      runScenario(scenario, text, target);
    },
    [runScenario]
  );

  const handleCancel = useCallback(() => {
    cancel();
  }, [cancel]);

  const hasMessages = messages.length > 0;
  const showBottomPanel = hasMessages && !isMobile;
  const hasActiveVisuals = containers.length > 0 || browserState !== null || networkConnections.length > 0;

  const sidebar = (
    <ChatSidebar
      activeAgents={activeAgents}
      credits={{ remaining, max }}
      canAfford={canAfford}
      onSelectScenario={handlePresetSelect}
      isPlaying={isPlaying}
      containers={containers}
      activePanel={activePanel}
      onPanelChange={setActivePanel}
    />
  );

  return (
    <div className="flex h-screen bg-[#0a0a0f]">
      {/* Desktop sidebar */}
      {!isMobile && (
        <div className="w-[280px] shrink-0 border-r border-white/[0.06] bg-[#08080d]">
          {sidebar}
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        {isMobile && (
          <div className="flex items-center gap-3 px-4 h-12 border-b border-white/[0.06] bg-[#08080d]">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <button className="p-1 text-[#888] hover:text-white">
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0 bg-[#08080d] border-white/[0.06]">
                {sidebar}
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <img
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663114013319/TAqStkfvjTyDDNXQ.png"
                alt="Harbinger"
                className="w-5 h-5 object-contain"
              />
              <span className="text-[13px] font-display font-semibold text-white">Demo</span>
            </div>
            <span className="text-[10px] font-mono text-[#555] ml-auto">{remaining} credits</span>
          </div>
        )}

        {/* Desktop panel tabs bar (when scenario is running) */}
        {!isMobile && hasMessages && (
          <div className="flex items-center gap-1 px-4 py-1.5 border-b border-white/[0.06] bg-[#08080d]">
            {[
              { id: "chat", label: "Chat", icon: "💬", count: messages.length },
              { id: "docker", label: "Docker Console", icon: "🐳", count: dockerLogs.length },
              { id: "browser", label: "Browser", icon: "🌐", active: !!browserState },
              { id: "network", label: "Network", icon: "🔗", count: networkConnections.filter((c) => c.active).length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActivePanel(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-mono transition-colors ${
                  activePanel === tab.id
                    ? "bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20"
                    : "text-[#555] hover:text-[#999] border border-transparent"
                }`}
              >
                <span className="text-xs">{tab.icon}</span>
                {tab.label}
                {"count" in tab && typeof tab.count === "number" && tab.count > 0 && (
                  <span className="text-[8px] px-1 py-0.5 rounded-full bg-white/[0.06] text-[#888]">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Primary panel */}
          <div className="flex-1 min-h-0">
            {activePanel === "chat" && (
              hasMessages ? (
                <ChatMessages messages={messages} />
              ) : (
                <div className="h-full flex items-center justify-center px-4">
                  <div className="text-center max-w-2xl">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <img
                        src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663114013319/TAqStkfvjTyDDNXQ.png"
                        alt="Harbinger"
                        className="w-10 h-10 object-contain"
                      />
                      <h2 className="font-display text-2xl font-bold text-white">Agent Swarm Demo</h2>
                    </div>
                    <p className="text-[14px] text-[#666] mb-8 max-w-md mx-auto leading-relaxed">
                      Watch 11 autonomous agents spawn Docker containers, run security tools, browse targets, and collaborate in real time.
                    </p>
                    <ScenarioPresets
                      onSelect={handlePresetSelect}
                      disabled={isPlaying}
                      canAfford={canAfford}
                    />
                  </div>
                </div>
              )
            )}

            {activePanel === "docker" && (
              <div className="h-full p-4 overflow-auto">
                <DockerConsole logs={dockerLogs} containers={containers} />
              </div>
            )}

            {activePanel === "browser" && (
              <div className="h-full p-4 overflow-auto">
                {browserState ? (
                  <BrowserView state={browserState} />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-2xl mb-2 block">🌐</span>
                      <p className="text-[13px] text-[#555]">Browser will activate when agents navigate to targets</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activePanel === "network" && (
              <div className="h-full p-4 overflow-auto">
                <NetworkGraph
                  activeAgents={activeAgents}
                  containers={containers}
                  connections={networkConnections}
                />
              </div>
            )}
          </div>

          {/* Bottom collapsible panel — Docker Console mini (desktop only, on chat tab) */}
          {showBottomPanel && activePanel === "chat" && hasActiveVisuals && (
            <div className="border-t border-white/[0.06]">
              <button
                onClick={() => setBottomPanelCollapsed(!bottomPanelCollapsed)}
                className="w-full flex items-center gap-2 px-4 py-1 bg-[#08080d] hover:bg-white/[0.02] transition-colors"
              >
                <span className="text-[10px] font-mono text-[#555]">🐳 Docker Console</span>
                {containers.filter((c) => c.status === "running").length > 0 && (
                  <span className="text-[9px] font-mono text-[#4ade80]">
                    {containers.filter((c) => c.status === "running").length} running
                  </span>
                )}
                <span className="ml-auto text-[#555]">
                  {bottomPanelCollapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </span>
              </button>
              {!bottomPanelCollapsed && (
                <div className="max-h-[200px]">
                  <DockerConsole logs={dockerLogs} containers={containers} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input bar */}
        <ChatInput
          onSubmit={handleFreeText}
          onCancel={handleCancel}
          isPlaying={isPlaying}
          disabled={remaining <= 0}
        />
      </div>

      <CreditsExhaustedDialog open={exhaustedOpen} onOpenChange={setExhaustedOpen} />
    </div>
  );
}
