interface CreditsDisplayProps {
  remaining: number;
  max: number;
}

export default function CreditsDisplay({ remaining, max }: CreditsDisplayProps) {
  const pct = (remaining / max) * 100;
  const color = remaining <= 2 ? "#ef4444" : remaining <= 5 ? "#f59e0b" : "#4ade80";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-[#666]">Demo Credits</span>
        <span className="text-[11px] font-mono font-medium" style={{ color }}>
          {remaining}/{max}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-[9px] text-[#444]">Resets daily</p>
    </div>
  );
}
