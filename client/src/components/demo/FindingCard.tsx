import type { Finding, Severity } from "@/lib/demo/types";

const severityConfig: Record<Severity, { color: string; bg: string; border: string; label: string }> = {
  critical: { color: "#ef4444", bg: "#ef444410", border: "#ef444425", label: "CRITICAL" },
  high: { color: "#f97316", bg: "#f9731610", border: "#f9731625", label: "HIGH" },
  medium: { color: "#f59e0b", bg: "#f59e0b10", border: "#f59e0b25", label: "MEDIUM" },
  low: { color: "#3b82f6", bg: "#3b82f610", border: "#3b82f625", label: "LOW" },
  info: { color: "#6b7280", bg: "#6b728010", border: "#6b728025", label: "INFO" },
};

export default function FindingCard({ finding }: { finding: Finding }) {
  const s = severityConfig[finding.severity];

  return (
    <div
      className="rounded-lg overflow-hidden animate-in ml-11"
      style={{ backgroundColor: s.bg, border: `1px solid ${s.border}` }}
    >
      <div className="flex items-center gap-2 px-3 py-1.5" style={{ borderBottom: `1px solid ${s.border}` }}>
        <span
          className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider"
          style={{ backgroundColor: s.color + "22", color: s.color }}
        >
          {s.label}
        </span>
        <span className="text-[12px] font-medium text-white truncate">{finding.title}</span>
      </div>
      <div className="px-3 py-2 space-y-1.5">
        <div className="text-[11px] font-mono text-[#888]">
          <span className="text-[#555]">Target:</span> {finding.target}
        </div>
        <p className="text-[11px] text-[#999] leading-[1.6]">{finding.description}</p>
        {finding.evidence && (
          <div className="mt-1 px-2 py-1.5 rounded bg-black/30 border border-white/[0.04]">
            <span className="text-[10px] font-mono text-[#f59e0b]">Evidence: </span>
            <span className="text-[10px] font-mono text-[#777]">{finding.evidence}</span>
          </div>
        )}
      </div>
    </div>
  );
}
