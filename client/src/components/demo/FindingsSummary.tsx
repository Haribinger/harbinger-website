import { motion, AnimatePresence } from "framer-motion";
import type { Finding, Severity } from "@/lib/demo/types";

interface FindingsSummaryProps {
  findings: Finding[];
}

const severityOrder: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};

const severityConfig: Record<Severity, { color: string; label: string }> = {
  critical: { color: "#ef4444", label: "CRIT" },
  high: { color: "#f97316", label: "HIGH" },
  medium: { color: "#f59e0b", label: "MED" },
  low: { color: "#3b82f6", label: "LOW" },
  info: { color: "#6b7280", label: "INFO" },
};

export default function FindingsSummary({ findings }: FindingsSummaryProps) {
  const sorted = [...findings].sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  );

  const counts = findings.reduce(
    (acc, f) => {
      acc[f.severity] = (acc[f.severity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-[#555] uppercase tracking-wider">
          Findings
        </span>
        <span className="text-[10px] font-mono text-[#888]">
          {findings.length} total
        </span>
      </div>

      {/* Severity breakdown bar */}
      {findings.length > 0 && (
        <div className="flex gap-1.5 mb-1">
          {(["critical", "high", "medium", "low", "info"] as Severity[]).map(
            (sev) =>
              counts[sev] ? (
                <div key={sev} className="flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: severityConfig[sev].color }}
                  />
                  <span
                    className="text-[9px] font-mono font-bold"
                    style={{ color: severityConfig[sev].color }}
                  >
                    {counts[sev]}
                  </span>
                </div>
              ) : null
          )}
        </div>
      )}

      {/* Finding list */}
      <AnimatePresence mode="popLayout">
        {sorted.map((finding, i) => {
          const s = severityConfig[finding.severity];
          return (
            <motion.div
              key={`${finding.title}-${i}`}
              initial={{ opacity: 0, x: 8, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-lg border overflow-hidden"
              style={{
                backgroundColor: s.color + "08",
                borderColor: s.color + "20",
              }}
            >
              <div className="flex items-start gap-2 px-2.5 py-2">
                <span
                  className="shrink-0 px-1 py-0.5 rounded text-[8px] font-mono font-bold tracking-wider mt-0.5"
                  style={{
                    backgroundColor: s.color + "22",
                    color: s.color,
                  }}
                >
                  {s.label}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-medium text-white truncate">
                    {finding.title}
                  </div>
                  <div className="text-[9px] font-mono text-[#555] truncate mt-0.5">
                    {finding.target}
                  </div>
                </div>
                {finding.cvss && (
                  <span
                    className="shrink-0 text-[9px] font-mono font-bold"
                    style={{ color: s.color }}
                  >
                    {finding.cvss}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {findings.length === 0 && (
        <div className="text-center py-4">
          <span className="text-[10px] text-[#333]">
            Findings will appear here
          </span>
        </div>
      )}
    </div>
  );
}
