import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/useMobile";
import { useCredits } from "@/lib/demo/credits";
import { hydrateScenario, matchScenario } from "@/lib/demo/scenarios";
import { useScenarioEngine } from "@/lib/demo/scenario-engine";
import type { Finding, Scenario } from "@/lib/demo/types";
import {
  ChevronDown,
  ChevronUp,
  Menu,
  PanelRightClose,
  PanelRightOpen,
  Settings,
  Gauge,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  RotateCcw,
  Download,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BrowserView from "./BrowserView";
import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";
import ChatSidebar from "./ChatSidebar";
import CreditsExhaustedDialog from "./CreditsExhaustedDialog";
import DockerConsole from "./DockerConsole";
import FindingsSummary from "./FindingsSummary";
import NetworkGraph from "./NetworkGraph";
import ScenarioPresets from "./ScenarioPresets";

type PanelId = "chat" | "docker" | "browser" | "network" | "findings";

interface PanelTab {
  id: PanelId;
  label: string;
  icon: string;
  badge?: string | number;
  active?: boolean;
}

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
    reset,
  } = useScenarioEngine();
  const [exhaustedOpen, setExhaustedOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<PanelId>("chat");
  const [bottomPanelCollapsed, setBottomPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  // Derive findings from messages
  const findings = useMemo<Finding[]>(
    () =>
      messages
        .filter((m) => m.type === "finding" && m.finding)
        .map((m) => m.finding!),
    [messages]
  );

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
      setRightDrawerOpen(false);
      setBottomPanelCollapsed(false);
      setRightPanelCollapsed(false);
      setActivePanel("chat");
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

  const handleReset = useCallback(() => {
    reset();
    setActivePanel("chat");
  }, [reset]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setFullscreen(false);
    }
  }, []);

  const hasMessages = messages.length > 0;
  const hasActiveVisuals =
    containers.length > 0 ||
    browserState !== null ||
    networkConnections.length > 0;
  const showRightPanel =
    hasMessages &&
    !isMobile &&
    !rightPanelCollapsed &&
    (browserState !== null || findings.length > 0) &&
    activePanel === "chat";
  const runningContainers = containers.filter((c) => c.status === "running");
  const activeConnections = networkConnections.filter((c) => c.active);

  // Panel tabs config
  const panelTabs: PanelTab[] = [
    {
      id: "chat",
      label: "Chat",
      icon: "💬",
      badge: messages.length > 0 ? messages.length : undefined,
    },
    {
      id: "docker",
      label: "Docker",
      icon: "🐳",
      badge: runningContainers.length > 0 ? `${runningContainers.length} live` : undefined,
    },
    {
      id: "browser",
      label: "Browser",
      icon: "🌐",
      active: !!browserState,
    },
    {
      id: "network",
      label: "Network",
      icon: "🔗",
      badge: activeConnections.length > 0 ? activeConnections.length : undefined,
    },
    {
      id: "findings",
      label: "Findings",
      icon: "🎯",
      badge: findings.length > 0 ? findings.length : undefined,
    },
  ];

  const sidebar = (
    <ChatSidebar
      activeAgents={activeAgents}
      credits={{ remaining, max }}
      canAfford={canAfford}
      onSelectScenario={handlePresetSelect}
      isPlaying={isPlaying}
      containers={containers}
    />
  );

  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden relative demo-scanline">
      {/* Desktop left sidebar */}
      {!isMobile && (
        <div className="w-[260px] shrink-0 border-r border-white/[0.06] bg-[#08080d] overflow-hidden">
          {sidebar}
        </div>
      )}

      {/* Main centre area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        {isMobile && (
          <div className="flex items-center gap-3 px-4 h-12 border-b border-white/[0.06] bg-[#08080d]">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <button className="p-1 text-[#888] hover:text-white">
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[280px] p-0 bg-[#08080d] border-white/[0.06]"
              >
                {sidebar}
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <img
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663114013319/TAqStkfvjTyDDNXQ.png"
                alt="Harbinger"
                className="w-5 h-5 object-contain"
              />
              <span className="text-[13px] font-display font-semibold text-white">
                Demo
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#555]">
                {remaining} credits
              </span>
              {hasMessages && (
                <Sheet
                  open={rightDrawerOpen}
                  onOpenChange={setRightDrawerOpen}
                >
                  <SheetTrigger asChild>
                    <button className="p-1 text-[#888] hover:text-white">
                      <PanelRightOpen className="w-4 h-4" />
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-[300px] p-0 bg-[#08080d] border-white/[0.06]"
                  >
                    <div className="flex flex-col h-full overflow-y-auto p-4 gap-4">
                      {browserState && <BrowserView state={browserState} />}
                      <FindingsSummary findings={findings} />
                      <NetworkGraph
                        activeAgents={activeAgents}
                        containers={containers}
                        connections={networkConnections}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </div>
          </div>
        )}

        {/* ═══ Panel Tabs Bar + Status + Settings ═══ */}
        {hasMessages && (
          <div className="border-b border-white/[0.06] bg-[#08080d]/80 backdrop-blur-sm">
            {/* Top row: status + settings */}
            <div className="flex items-center gap-2 px-4 py-1.5">
              {/* Live status indicator */}
              <div className="flex items-center gap-1.5">
                {isPlaying ? (
                  <motion.span
                    className="w-2 h-2 rounded-full bg-[#4ade80]"
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-[#555]" />
                )}
                <span className="text-[10px] font-mono text-[#888]">
                  {isPlaying ? "LIVE" : "COMPLETE"}
                </span>
              </div>

              <div className="w-px h-3 bg-white/[0.06]" />

              {/* Metrics */}
              {!isMobile && (
                <>
                  <span className="text-[10px] font-mono text-[#555]">
                    <span className="text-[#888]">{activeAgents.size}</span>{" "}
                    agents
                  </span>
                  <div className="w-px h-3 bg-white/[0.06]" />
                  <span className="text-[10px] font-mono text-[#555]">
                    <span className="text-[#00d4ff]">
                      {runningContainers.length}
                    </span>{" "}
                    containers
                  </span>
                  <div className="w-px h-3 bg-white/[0.06]" />
                  <span className="text-[10px] font-mono text-[#555]">
                    <span className="text-[#ef4444]">
                      {findings.length}
                    </span>{" "}
                    findings
                  </span>
                </>
              )}

              {/* Right-side controls */}
              <div className="ml-auto flex items-center gap-1">
                {/* Reset button */}
                {hasMessages && !isPlaying && (
                  <button
                    onClick={handleReset}
                    className="p-1.5 text-[#555] hover:text-[#888] transition-colors rounded hover:bg-white/[0.03]"
                    title="Reset demo"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Fullscreen toggle */}
                {!isMobile && (
                  <button
                    onClick={toggleFullscreen}
                    className="p-1.5 text-[#555] hover:text-[#888] transition-colors rounded hover:bg-white/[0.03]"
                    title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
                  >
                    {fullscreen ? (
                      <Minimize2 className="w-3.5 h-3.5" />
                    ) : (
                      <Maximize2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}

                {/* Right panel toggle */}
                {!isMobile &&
                  (browserState || findings.length > 0) &&
                  activePanel === "chat" && (
                    <button
                      onClick={() =>
                        setRightPanelCollapsed(!rightPanelCollapsed)
                      }
                      className="p-1.5 text-[#555] hover:text-[#888] transition-colors rounded hover:bg-white/[0.03]"
                      title={
                        rightPanelCollapsed
                          ? "Show intel panel"
                          : "Hide intel panel"
                      }
                    >
                      {rightPanelCollapsed ? (
                        <PanelRightOpen className="w-3.5 h-3.5" />
                      ) : (
                        <PanelRightClose className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}

                {/* Settings dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setSettingsOpen(!settingsOpen)}
                    className={`p-1.5 transition-colors rounded hover:bg-white/[0.03] ${
                      settingsOpen
                        ? "text-[#00d4ff]"
                        : "text-[#555] hover:text-[#888]"
                    }`}
                    title="Settings"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                  <AnimatePresence>
                    {settingsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-1 w-56 z-50 rounded-lg border border-white/[0.08] bg-[#0c0c14] shadow-xl shadow-black/40 overflow-hidden"
                      >
                        <div className="px-3 py-2 border-b border-white/[0.06]">
                          <span className="text-[10px] font-mono text-[#555] uppercase tracking-wider">
                            Display Settings
                          </span>
                        </div>
                        <div className="p-1.5 space-y-0.5">
                          {/* Auto-scroll */}
                          <button
                            onClick={() => setAutoScroll(!autoScroll)}
                            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-left hover:bg-white/[0.03] transition-colors"
                          >
                            <Gauge className="w-3.5 h-3.5 text-[#555]" />
                            <span className="text-[11px] text-[#999] flex-1">
                              Auto-scroll
                            </span>
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                autoScroll
                                  ? "bg-[#4ade80]/15 text-[#4ade80]"
                                  : "bg-white/[0.04] text-[#555]"
                              }`}
                            >
                              {autoScroll ? "ON" : "OFF"}
                            </span>
                          </button>

                          {/* Timestamps */}
                          <button
                            onClick={() =>
                              setShowTimestamps(!showTimestamps)
                            }
                            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-left hover:bg-white/[0.03] transition-colors"
                          >
                            {showTimestamps ? (
                              <Eye className="w-3.5 h-3.5 text-[#555]" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5 text-[#555]" />
                            )}
                            <span className="text-[11px] text-[#999] flex-1">
                              Timestamps
                            </span>
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                showTimestamps
                                  ? "bg-[#4ade80]/15 text-[#4ade80]"
                                  : "bg-white/[0.04] text-[#555]"
                              }`}
                            >
                              {showTimestamps ? "ON" : "OFF"}
                            </span>
                          </button>

                          {/* Compact mode */}
                          <button
                            onClick={() => setCompactMode(!compactMode)}
                            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-left hover:bg-white/[0.03] transition-colors"
                          >
                            <Minimize2 className="w-3.5 h-3.5 text-[#555]" />
                            <span className="text-[11px] text-[#999] flex-1">
                              Compact mode
                            </span>
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                compactMode
                                  ? "bg-[#4ade80]/15 text-[#4ade80]"
                                  : "bg-white/[0.04] text-[#555]"
                              }`}
                            >
                              {compactMode ? "ON" : "OFF"}
                            </span>
                          </button>

                          {/* Sound */}
                          <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-left hover:bg-white/[0.03] transition-colors"
                          >
                            {soundEnabled ? (
                              <Volume2 className="w-3.5 h-3.5 text-[#555]" />
                            ) : (
                              <VolumeX className="w-3.5 h-3.5 text-[#555]" />
                            )}
                            <span className="text-[11px] text-[#999] flex-1">
                              Sound effects
                            </span>
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                soundEnabled
                                  ? "bg-[#4ade80]/15 text-[#4ade80]"
                                  : "bg-white/[0.04] text-[#555]"
                              }`}
                            >
                              {soundEnabled ? "ON" : "OFF"}
                            </span>
                          </button>
                        </div>

                        {/* Actions section */}
                        <div className="px-3 py-2 border-t border-white/[0.06]">
                          <span className="text-[10px] font-mono text-[#555] uppercase tracking-wider">
                            Actions
                          </span>
                        </div>
                        <div className="p-1.5 space-y-0.5">
                          {/* Export report */}
                          <button
                            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-left hover:bg-white/[0.03] transition-colors"
                            onClick={() => setSettingsOpen(false)}
                          >
                            <Download className="w-3.5 h-3.5 text-[#555]" />
                            <span className="text-[11px] text-[#999]">
                              Export findings
                            </span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-[#555] ml-auto">
                              JSON
                            </span>
                          </button>

                          {/* Reset */}
                          <button
                            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-left hover:bg-white/[0.03] transition-colors"
                            onClick={() => {
                              handleReset();
                              setSettingsOpen(false);
                            }}
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-[#555]" />
                            <span className="text-[11px] text-[#999]">
                              Clear & reset
                            </span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Bottom row: panel tabs */}
            <div className="flex items-center gap-1 px-4 pb-1.5 overflow-x-auto">
              {panelTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActivePanel(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-mono transition-all shrink-0 ${
                    activePanel === tab.id
                      ? "bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20"
                      : "text-[#555] hover:text-[#999] border border-transparent hover:bg-white/[0.02]"
                  }`}
                >
                  <span className="text-xs">{tab.icon}</span>
                  {tab.label}
                  {tab.badge !== undefined && (
                    <span
                      className={`text-[8px] px-1 py-0.5 rounded-full ${
                        activePanel === tab.id
                          ? "bg-[#00d4ff]/20 text-[#00d4ff]"
                          : "bg-white/[0.06] text-[#888]"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                  {tab.active && activePanel !== tab.id && (
                    <motion.span
                      className="w-1.5 h-1.5 rounded-full bg-[#4ade80]"
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ═══ Main Content Area ═══ */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 min-h-0">
            {/* Chat panel */}
            {activePanel === "chat" && (
              <>
                {hasMessages ? (
                  <ChatMessages messages={messages} />
                ) : (
                  <div className="h-full flex items-center justify-center px-4 demo-grid-bg relative">
                    <div className="text-center max-w-2xl relative z-10">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.6,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="flex items-center justify-center gap-3 mb-4"
                      >
                        <div className="relative">
                          <img
                            src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663114013319/TAqStkfvjTyDDNXQ.png"
                            alt="Harbinger"
                            className="w-12 h-12 object-contain"
                          />
                          <div className="absolute inset-0 bg-[#00d4ff]/20 rounded-full blur-xl" />
                        </div>
                        <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                          Agent Swarm Demo
                        </h2>
                      </motion.div>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-[14px] text-[#666] mb-8 max-w-md mx-auto leading-relaxed"
                      >
                        Watch 11 autonomous agents spawn Docker containers,
                        run security tools, browse targets, and collaborate
                        in real time.
                      </motion.p>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35, duration: 0.5 }}
                      >
                        <ScenarioPresets
                          onSelect={handlePresetSelect}
                          disabled={isPlaying}
                          canAfford={canAfford}
                        />
                      </motion.div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Docker Console panel (full view) */}
            {activePanel === "docker" && (
              <div className="h-full p-4 overflow-auto">
                {dockerLogs.length > 0 ? (
                  <DockerConsole logs={dockerLogs} containers={containers} />
                ) : (
                  <EmptyPanel
                    icon="🐳"
                    title="Docker Console"
                    description="Container logs and tool output will appear here when a scenario runs."
                  />
                )}
              </div>
            )}

            {/* Browser panel (full view) */}
            {activePanel === "browser" && (
              <div className="h-full p-4 overflow-auto">
                {browserState ? (
                  <div className="max-w-2xl mx-auto">
                    <BrowserView state={browserState} />
                  </div>
                ) : (
                  <EmptyPanel
                    icon="🌐"
                    title="Browser View"
                    description="Browser will activate when agents navigate to targets during a scan."
                  />
                )}
              </div>
            )}

            {/* Network panel (full view) */}
            {activePanel === "network" && (
              <div className="h-full p-4 overflow-auto">
                {containers.length > 0 || activeAgents.size > 0 ? (
                  <NetworkGraph
                    activeAgents={activeAgents}
                    containers={containers}
                    connections={networkConnections}
                  />
                ) : (
                  <EmptyPanel
                    icon="🔗"
                    title="Network Graph"
                    description="Agent-to-agent data flows and container connections will visualise here."
                  />
                )}
              </div>
            )}

            {/* Findings panel (full view) */}
            {activePanel === "findings" && (
              <div className="h-full p-4 overflow-auto">
                <div className="max-w-2xl mx-auto">
                  {findings.length > 0 ? (
                    <FindingsSummary findings={findings} />
                  ) : (
                    <EmptyPanel
                      icon="🎯"
                      title="Findings"
                      description="Discovered vulnerabilities with severity, CVSS scores, and evidence will appear here."
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Docker console mini (desktop, chat tab only, when active) */}
          {!isMobile &&
            activePanel === "chat" &&
            hasMessages &&
            hasActiveVisuals && (
              <div className="border-t border-white/[0.06]">
                <button
                  onClick={() =>
                    setBottomPanelCollapsed(!bottomPanelCollapsed)
                  }
                  className="w-full flex items-center gap-2 px-4 py-1 bg-[#08080d] hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-[10px] font-mono text-[#555]">
                    🐳 Docker Console
                  </span>
                  {runningContainers.length > 0 && (
                    <span className="text-[9px] font-mono text-[#4ade80]">
                      {runningContainers.length} running
                    </span>
                  )}
                  <span className="ml-auto text-[#555]">
                    {bottomPanelCollapsed ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </span>
                </button>
                <AnimatePresence>
                  {!bottomPanelCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="max-h-[180px]">
                        <DockerConsole
                          logs={dockerLogs}
                          containers={containers}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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

      {/* Desktop right sidebar — Intel Panel (chat tab only) */}
      <AnimatePresence>
        {showRightPanel && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="shrink-0 border-l border-white/[0.06] bg-[#08080d] overflow-hidden"
          >
            <div className="w-[300px] flex flex-col h-full overflow-y-auto">
              {/* Right panel header */}
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#555] uppercase tracking-wider">
                    Intel Panel
                  </span>
                  {isPlaying && (
                    <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-[#00d4ff]/10 text-[#00d4ff]">
                      LIVE
                    </span>
                  )}
                </div>
              </div>

              {/* Browser view */}
              {browserState && (
                <div className="px-3 pt-3">
                  <div className="text-[10px] font-mono text-[#555] uppercase tracking-wider mb-2">
                    Browser
                  </div>
                  <BrowserView state={browserState} />
                </div>
              )}

              {/* Network graph mini */}
              {activeConnections.length > 0 && (
                <div className="px-3 pt-3">
                  <div className="text-[10px] font-mono text-[#555] uppercase tracking-wider mb-2">
                    Network
                  </div>
                  <NetworkGraph
                    activeAgents={activeAgents}
                    containers={containers}
                    connections={networkConnections}
                  />
                </div>
              )}

              {/* Findings summary */}
              <div className="px-3 pt-3 pb-4 flex-1">
                <FindingsSummary findings={findings} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close settings when clicking outside */}
      {settingsOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setSettingsOpen(false)}
        />
      )}

      <CreditsExhaustedDialog
        open={exhaustedOpen}
        onOpenChange={setExhaustedOpen}
      />
    </div>
  );
}

/* ── Empty panel placeholder ── */
function EmptyPanel({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="h-full flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center max-w-xs"
      >
        <span className="text-3xl mb-3 block">{icon}</span>
        <div className="text-[13px] font-medium text-[#888] mb-1">
          {title}
        </div>
        <p className="text-[11px] text-[#444] leading-relaxed">
          {description}
        </p>
      </motion.div>
    </div>
  );
}
