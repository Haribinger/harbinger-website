import { scanPresets, type ScanPreset } from "@/lib/demo/scan-presets";
import { motion } from "framer-motion";

interface ScenarioPresetsProps {
  onSelect: (preset: ScanPreset) => void;
  disabled?: boolean;
  canAfford: (cost: number) => boolean;
  compact?: boolean;
}

export default function ScenarioPresets({
  onSelect,
  disabled,
  canAfford,
  compact,
}: ScenarioPresetsProps) {
  if (compact) {
    return (
      <div className="space-y-1.5">
        {scanPresets.map((s, i) => {
          const affordable = canAfford(s.cost);
          return (
            <motion.button
              key={s.id}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onSelect(s)}
              disabled={disabled || !affordable}
              whileHover={!disabled && affordable ? { x: 2 } : undefined}
              whileTap={!disabled && affordable ? { scale: 0.98 } : undefined}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] transition-colors disabled:opacity-30 disabled:hover:bg-white/[0.02] group"
            >
              <span className="text-sm">{s.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] text-white font-medium truncate">
                  {s.title}
                </div>
              </div>
              <span className="text-[10px] font-mono text-[#555] group-hover:text-[#888] shrink-0">
                {s.cost}cr
              </span>
            </motion.button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
      {scanPresets.map((s, i) => {
        const affordable = canAfford(s.cost);
        return (
          <motion.button
            key={s.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
            onClick={() => onSelect(s)}
            disabled={disabled || !affordable}
            whileHover={
              !disabled && affordable
                ? { y: -2, borderColor: "rgba(0,212,255,0.3)" }
                : undefined
            }
            whileTap={
              !disabled && affordable ? { scale: 0.97 } : undefined
            }
            className="flex flex-col items-start gap-2 p-4 rounded-xl border border-white/[0.06] bg-[#0c0c12] hover:bg-[#00d4ff]/[0.03] transition-all disabled:opacity-30 disabled:hover:border-white/[0.06] disabled:hover:bg-[#0c0c12] group text-left"
          >
            <div className="flex items-center gap-2 w-full">
              <span className="text-lg">{s.icon}</span>
              <span className="text-[10px] font-mono text-[#555] ml-auto group-hover:text-[#00d4ff] transition-colors">
                {s.cost} credits
              </span>
            </div>
            <div className="text-[13px] text-white font-medium">
              {s.title}
            </div>
            <div className="text-[11px] text-[#666] leading-relaxed">
              {s.description}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
