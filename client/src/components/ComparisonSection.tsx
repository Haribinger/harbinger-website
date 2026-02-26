import SectionWrapper, { SectionDesc, SectionLabel, SectionTitle } from "./SectionWrapper";
import { Check, Minus, X } from "lucide-react";

interface Row {
  feature: string;
  harbinger: "yes" | "no" | "partial";
  pentagi: "yes" | "no" | "partial";
  hexstrike: "yes" | "no" | "partial";
  agentZero: "yes" | "no" | "partial";
  pdCloud: "yes" | "no" | "partial";
}

const rows: Row[] = [
  { feature: "Multi-Agent Workflows", harbinger: "yes", pentagi: "yes", hexstrike: "no", agentZero: "partial", pdCloud: "no" },
  { feature: "150+ Security Tools (MCP)", harbinger: "yes", pentagi: "no", hexstrike: "yes", agentZero: "no", pdCloud: "partial" },
  { feature: "100% Local-First", harbinger: "yes", pentagi: "no", hexstrike: "partial", agentZero: "yes", pdCloud: "no" },
  { feature: "Observable Event Streams", harbinger: "yes", pentagi: "partial", hexstrike: "yes", agentZero: "no", pdCloud: "yes" },
  { feature: "Workflow Graph Engine", harbinger: "yes", pentagi: "no", hexstrike: "no", agentZero: "no", pdCloud: "no" },
  { feature: "Git-as-Memory Audit Trail", harbinger: "yes", pentagi: "no", hexstrike: "no", agentZero: "no", pdCloud: "no" },
  { feature: "Setup Wizard + Device Flow", harbinger: "yes", pentagi: "no", hexstrike: "no", agentZero: "no", pdCloud: "partial" },
  { feature: "Production Security Hardening", harbinger: "yes", pentagi: "partial", hexstrike: "no", agentZero: "no", pdCloud: "yes" },
  { feature: "Plugin SDK", harbinger: "yes", pentagi: "no", hexstrike: "no", agentZero: "yes", pdCloud: "partial" },
  { feature: "Docker Isolation", harbinger: "yes", pentagi: "yes", hexstrike: "partial", agentZero: "yes", pdCloud: "yes" },
  { feature: "Knowledge Graph (Neo4j)", harbinger: "yes", pentagi: "yes", hexstrike: "no", agentZero: "no", pdCloud: "no" },
];

function Cell({ val, highlight }: { val: "yes" | "no" | "partial"; highlight?: boolean }) {
  if (val === "yes") return <Check className={`w-3.5 h-3.5 ${highlight ? "text-[#4ade80] drop-shadow-[0_0_4px_rgba(74,222,128,0.4)]" : "text-[#4ade80]"}`} />;
  if (val === "partial") return <Minus className="w-3.5 h-3.5 text-[#f59e0b]" />;
  return <X className="w-3.5 h-3.5 text-[#333]" />;
}

const platforms = [
  { key: "harbinger" as const, label: "Harbinger", stars: "—" },
  { key: "pentagi" as const, label: "PentAGI", stars: "7.9k" },
  { key: "hexstrike" as const, label: "HexStrike", stars: "7.1k" },
  { key: "agentZero" as const, label: "Agent Zero", stars: "15.4k" },
  { key: "pdCloud" as const, label: "PD Cloud", stars: "27.2k" },
];

export default function ComparisonSection() {
  return (
    <SectionWrapper id="comparison">
      <SectionLabel>Competitive Landscape</SectionLabel>
      <SectionTitle>How Harbinger compares.</SectionTitle>
      <SectionDesc>
        The only platform combining multi-agent orchestration, 150+ MCP tools, local-first operation, and full observability.
      </SectionDesc>

      <div className="mt-14 rounded-lg border border-white/[0.06] overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left p-3 pl-4 font-mono text-[11px] text-[#555] font-normal">Feature</th>
              {platforms.map((p) => (
                <th key={p.key} className={`text-center p-3 font-mono text-[11px] font-normal ${p.key === "harbinger" ? "text-[#00d4ff] bg-[#00d4ff]/[0.03]" : "text-[#555]"}`}>
                  <div>{p.label}</div>
                  <div className="text-[10px] text-[#333] mt-0.5">{p.stars} ★</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.feature} className={`border-b border-white/[0.03] ${i % 2 === 0 ? "" : "bg-white/[0.01]"}`}>
                <td className="p-3 pl-4 text-[#999]">{r.feature}</td>
                {platforms.map((p) => (
                  <td key={p.key} className={`text-center p-3 ${p.key === "harbinger" ? "bg-[#00d4ff]/[0.03]" : ""}`}>
                    <div className="flex justify-center">
                      <Cell val={r[p.key]} highlight={p.key === "harbinger"} />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionWrapper>
  );
}
