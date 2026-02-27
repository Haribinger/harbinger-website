import { scenarios } from "@/lib/demo/scenarios";
import type { Scenario } from "@/lib/demo/types";

interface ScenarioPresetsProps {
  onSelect: (scenario: Scenario) => void;
  disabled?: boolean;
  canAfford: (cost: number) => boolean;
  compact?: boolean;
}

export default function ScenarioPresets({ onSelect, disabled, canAfford, compact }: ScenarioPresetsProps) {
  if (compact) {
    return (
      <div className="space-y-1.5">
        {scenarios.map((s) => {
          const affordable = canAfford(s.cost);
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s)}
              disabled={disabled || !affordable}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] transition-colors disabled:opacity-30 disabled:hover:bg-white/[0.02] group"
            >
              <span className="text-sm">{s.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] text-white font-medium truncate">{s.title}</div>
              </div>
              <span className="text-[10px] font-mono text-[#555] group-hover:text-[#888] shrink-0">
                {s.cost}cr
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
      {scenarios.map((s) => {
        const affordable = canAfford(s.cost);
        return (
          <button
            key={s.id}
            onClick={() => onSelect(s)}
            disabled={disabled || !affordable}
            className="flex flex-col items-start gap-2 p-4 rounded-xl border border-white/[0.06] bg-[#0c0c12] hover:border-[#00d4ff]/20 hover:bg-[#00d4ff]/[0.03] transition-all disabled:opacity-30 disabled:hover:border-white/[0.06] disabled:hover:bg-[#0c0c12] group text-left"
          >
            <div className="flex items-center gap-2 w-full">
              <span className="text-lg">{s.icon}</span>
              <span className="text-[10px] font-mono text-[#555] ml-auto group-hover:text-[#00d4ff]">
                {s.cost} credits
              </span>
            </div>
            <div className="text-[13px] text-white font-medium">{s.title}</div>
            <div className="text-[11px] text-[#666] leading-relaxed">{s.description}</div>
          </button>
        );
      })}
    </div>
  );
}
