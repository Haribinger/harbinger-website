import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/useMobile";
import { useCredits } from "@/lib/demo/credits";
import { hydrateScenario, matchScenario } from "@/lib/demo/scenarios";
import { useScenarioEngine } from "@/lib/demo/scenario-engine";
import type { Scenario } from "@/lib/demo/types";
import { Menu } from "lucide-react";
import { useCallback, useState } from "react";
import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";
import ChatSidebar from "./ChatSidebar";
import CreditsExhaustedDialog from "./CreditsExhaustedDialog";
import ScenarioPresets from "./ScenarioPresets";

export default function ChatLayout() {
  const isMobile = useIsMobile();
  const { remaining, max, spend, canAfford } = useCredits();
  const { messages, activeAgents, isPlaying, playScenario, cancel, reset } = useScenarioEngine();
  const [exhaustedOpen, setExhaustedOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const sidebar = (
    <ChatSidebar
      activeAgents={activeAgents}
      credits={{ remaining, max }}
      canAfford={canAfford}
      onSelectScenario={handlePresetSelect}
      isPlaying={isPlaying}
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

      {/* Main chat area */}
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

        {/* Chat content */}
        {hasMessages ? (
          <ChatMessages messages={messages} />
        ) : (
          <div className="flex-1 flex items-center justify-center px-4">
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
                Watch 11 autonomous agents collaborate on real security tasks. Choose a scenario below or describe your own target.
              </p>
              <ScenarioPresets
                onSelect={handlePresetSelect}
                disabled={isPlaying}
                canAfford={canAfford}
              />
            </div>
          </div>
        )}

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
