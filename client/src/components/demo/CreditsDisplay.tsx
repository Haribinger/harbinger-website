import { motion } from "framer-motion";

interface CreditsDisplayProps {
  remaining: number;
  max: number;
}

export default function CreditsDisplay({
  remaining,
  max,
}: CreditsDisplayProps) {
  const pct = (remaining / max) * 100;
  const color =
    remaining <= 2 ? "#ef4444" : remaining <= 5 ? "#f59e0b" : "#4ade80";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-[#666]">Demo Credits</span>
        <motion.span
          key={remaining}
          initial={{ scale: 1.2, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-[11px] font-mono font-medium"
          style={{ color }}
        >
          {remaining}/{max}
        </motion.span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden relative">
        <motion.div
          className="h-full rounded-full"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ backgroundColor: color }}
        />
        {remaining > 0 && (
          <div
            className="absolute inset-0 progress-shimmer"
            style={{ width: `${pct}%` }}
          />
        )}
      </div>
      <p className="text-[9px] text-[#444]">Resets daily</p>
    </div>
  );
}
