import type { Finding, Severity } from "@/lib/demo/types";
import { motion } from "framer-motion";
import { memo, useMemo, useState } from "react";

const severityConfig: Record<
  Severity,
  {
    color: string;
    bg: string;
    border: string;
    label: string;
    cvssRange: [number, number];
  }
> = {
  critical: {
    color: "#ef4444",
    bg: "#ef444410",
    border: "#ef444425",
    label: "CRITICAL",
    cvssRange: [9.0, 10.0],
  },
  high: {
    color: "#f97316",
    bg: "#f9731610",
    border: "#f9731625",
    label: "HIGH",
    cvssRange: [7.0, 8.9],
  },
  medium: {
    color: "#f59e0b",
    bg: "#f59e0b10",
    border: "#f59e0b25",
    label: "MEDIUM",
    cvssRange: [4.0, 6.9],
  },
  low: {
    color: "#3b82f6",
    bg: "#3b82f610",
    border: "#3b82f625",
    label: "LOW",
    cvssRange: [0.1, 3.9],
  },
  info: {
    color: "#6b7280",
    bg: "#6b728010",
    border: "#6b728025",
    label: "INFO",
    cvssRange: [0, 0],
  },
};

function getCvss(finding: Finding): number {
  if (finding.cvss) return finding.cvss;
  const range = severityConfig[finding.severity].cvssRange;
  return Number(
    (range[0] + Math.random() * (range[1] - range[0])).toFixed(1)
  );
}

const FindingCard = memo(function FindingCard({ finding }: { finding: Finding }) {
  const s = severityConfig[finding.severity];
  // Stabilize the CVSS score across re-renders using useMemo so Math.random() is not called on every render
  const cvss = useMemo(() => getCvss(finding), [finding.cvss, finding.severity, finding.title]);
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -8, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-lg overflow-hidden ml-11 finding-card-glow"
      style={{
        backgroundColor: s.bg,
        border: `1px solid ${s.border}`,
        ["--finding-color" as string]: s.color,
        boxShadow: `0 0 8px ${s.color}12`,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
        style={{ borderBottom: `1px solid ${s.border}` }}
      >
        <motion.span
          animate={
            finding.severity === "critical"
              ? { scale: [1, 1.1, 1] }
              : undefined
          }
          transition={
            finding.severity === "critical"
              ? { duration: 1.5, repeat: Infinity }
              : undefined
          }
          className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider shrink-0"
          style={{ backgroundColor: s.color + "22", color: s.color }}
        >
          {s.label}
        </motion.span>
        <span className="text-[12px] font-medium text-white truncate flex-1">
          {finding.title}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {/* CVSS badge */}
          <span
            className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold"
            style={{ backgroundColor: s.color + "15", color: s.color }}
          >
            CVSS {cvss}
          </span>
          <motion.svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            className="text-[#555]"
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <path
              d="M2 3.5l3 3 3-3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </motion.svg>
        </div>
      </div>

      {/* Body */}
      <div className="px-3 py-2 space-y-1.5">
        <div className="text-[11px] font-mono text-[#888]">
          <span className="text-[#555]">Target:</span> {finding.target}
        </div>
        <p className="text-[11px] text-[#999] leading-[1.6]">
          {finding.description}
        </p>

        {/* Evidence */}
        {finding.evidence && (
          <div className="mt-1 px-2 py-1.5 rounded bg-black/30 border border-white/[0.04]">
            <span className="text-[10px] font-mono text-[#f59e0b]">
              Evidence:{" "}
            </span>
            <span className="text-[10px] font-mono text-[#777]">
              {finding.evidence}
            </span>
          </div>
        )}

        {/* Expanded details */}
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2 space-y-2 pt-2 border-t border-white/[0.04]"
          >
            {/* CVSS breakdown */}
            <div className="flex flex-wrap gap-2">
              {[
                "Attack Vector: Network",
                "Complexity: Low",
                "Privileges: None",
                "User Interaction: None",
              ].map((item) => (
                <span
                  key={item}
                  className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-white/[0.04] text-[#777]"
                >
                  {item}
                </span>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="px-2.5 py-1 rounded text-[10px] font-mono font-medium transition-colors hover:brightness-125"
                style={{
                  backgroundColor: s.color + "15",
                  color: s.color,
                  border: `1px solid ${s.color}25`,
                }}
              >
                View Exploit PoC
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="px-2.5 py-1 rounded text-[10px] font-mono font-medium bg-white/[0.04] text-[#888] border border-white/[0.06] hover:text-white transition-colors"
              >
                Remediation Steps
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
});

export default FindingCard;
