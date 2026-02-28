import { useEffect, useRef, useState } from "react";
import SectionWrapper, { SectionDesc, SectionLabel, SectionTitle } from "./SectionWrapper";

const dimensions = [
  { name: "Reconnaissance", icon: "scan", color: "#00d4ff", metric: "Coverage" },
  { name: "Exploitation", icon: "target", color: "#ef4444", metric: "Success Rate" },
  { name: "Efficiency", icon: "zap", color: "#f59e0b", metric: "Cost Ratio" },
  { name: "Coordination", icon: "network", color: "#a78bfa", metric: "Handoff Speed" },
  { name: "Reporting", icon: "file", color: "#4ade80", metric: "Completeness" },
];

interface ThoughtEntry {
  ts: string;
  agent: string;
  agentColor: string;
  dimension: string;
  observation: string;
  proposal: string;
  efficiency: number;
  status: "AWAITING_APPROVAL" | "APPROVED" | "EXECUTING" | "COMPLETED";
}

const thoughts: ThoughtEntry[] = [
  {
    ts: "14:23:01",
    agent: "PATHFINDER",
    agentColor: "#00d4ff",
    dimension: "RECONNAISSANCE",
    observation: "3 subdomains not yet probed for common web vulnerabilities",
    proposal: "Run nuclei on remaining subdomains with high,critical severity",
    efficiency: 47,
    status: "AWAITING_APPROVAL",
  },
  {
    ts: "14:23:04",
    agent: "BREACH",
    agentColor: "#ef4444",
    dimension: "EXPLOITATION",
    observation: "SQLi finding on login form not yet escalated",
    proposal: "Attempt privilege escalation via UNION-based injection",
    efficiency: 72,
    status: "APPROVED",
  },
  {
    ts: "14:23:08",
    agent: "SAGE",
    agentColor: "#f59e0b",
    dimension: "EFFICIENCY",
    observation: "CIPHER spent 340 tokens on low-value binary analysis",
    proposal: "Route binary analysis to local Ollama model to reduce cost by 85%",
    efficiency: 91,
    status: "EXECUTING",
  },
  {
    ts: "14:23:12",
    agent: "SPECTER",
    agentColor: "#4ade80",
    dimension: "COORDINATION",
    observation: "OSINT results overlap with PATHFINDER recon data",
    proposal: "Merge finding graphs and deduplicate before handoff to SCRIBE",
    efficiency: 63,
    status: "COMPLETED",
  },
];

function ThoughtLog() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    if (visibleCount >= thoughts.length) {
      const t = setTimeout(() => setVisibleCount(0), 4000);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setVisibleCount((v) => v + 1), 2200);
    return () => clearTimeout(t);
  }, [visibleCount, isVisible]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [visibleCount]);

  const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
    AWAITING_APPROVAL: { bg: "bg-[#f59e0b]/10", text: "text-[#f59e0b]", border: "border-[#f59e0b]/20" },
    APPROVED: { bg: "bg-[#4ade80]/10", text: "text-[#4ade80]", border: "border-[#4ade80]/20" },
    EXECUTING: { bg: "bg-[#00d4ff]/10", text: "text-[#00d4ff]", border: "border-[#00d4ff]/20" },
    COMPLETED: { bg: "bg-[#555]/10", text: "text-[#888]", border: "border-[#555]/20" },
  };

  return (
    <div ref={containerRef} className="rounded-xl border border-white/[0.06] bg-[#0c0c12] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse" />
          <span className="font-mono text-[11px] text-[#888]">AUTONOMOUS THOUGHT LOG</span>
        </div>
        <span className="font-mono text-[10px] text-[#444]">60s cycle</span>
      </div>

      {/* Thought entries */}
      <div ref={scrollRef} className="p-4 space-y-3 h-[340px] overflow-hidden">
        {thoughts.slice(0, visibleCount).map((t, i) => {
          const s = statusStyles[t.status];
          return (
            <div
              key={i}
              className="rounded-lg border border-white/[0.04] bg-white/[0.01] p-3 animate-in fade-in slide-in-from-bottom-2 duration-500"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-[#444]">{t.ts}</span>
                  <span className="font-mono text-[11px] font-semibold" style={{ color: t.agentColor }}>{t.agent}</span>
                  <span className="font-mono text-[9px] text-[#555] uppercase tracking-wider">{t.dimension}</span>
                </div>
                <span className={`font-mono text-[9px] px-2 py-0.5 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
                  {t.status.replace("_", " ")}
                </span>
              </div>
              <div className="text-[11px] text-[#777] mb-1.5">
                <span className="text-[#555]">Observation:</span> {t.observation}
              </div>
              <div className="text-[11px] text-[#999]">
                <span className="text-[#555]">Proposal:</span> {t.proposal}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1 rounded-full bg-white/[0.04] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${t.efficiency}%`,
                      backgroundColor: t.efficiency > 70 ? "#4ade80" : t.efficiency > 50 ? "#f59e0b" : "#ef4444",
                    }}
                  />
                </div>
                <span className="font-mono text-[9px] text-[#555]">{t.efficiency}%</span>
              </div>
            </div>
          );
        })}

        {visibleCount < thoughts.length && (
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-ping" />
            <span className="font-mono text-[10px] text-[#555]">Agents thinking...</span>
          </div>
        )}
      </div>
    </div>
  );
}

function DimensionIcon({ type, color }: { type: string; color: string }) {
  const props = { width: 16, height: 16, fill: "none", stroke: color, strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (type) {
    case "scan": return <svg {...props} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 12l4.2-4.2" /><circle cx="12" cy="12" r="3" opacity=".5" /></svg>;
    case "target": return <svg {...props} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" fill={color} /></svg>;
    case "zap": return <svg {...props} viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>;
    case "network": return <svg {...props} viewBox="0 0 24 24"><circle cx="6" cy="6" r="2" /><circle cx="18" cy="6" r="2" /><circle cx="12" cy="18" r="2" /><path d="M8 7l2 8M16 7l-2 8" /></svg>;
    case "file": return <svg {...props} viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>;
    default: return null;
  }
}

export default function AutonomousSection() {
  return (
    <SectionWrapper id="autonomous">
      <SectionLabel>Autonomous Intelligence</SectionLabel>
      <SectionTitle>Agents that think for themselves.</SectionTitle>
      <SectionDesc>
        They analyze their own work, identify improvements, and propose automations — continuously. Every 60 seconds, each agent evaluates 5 operational dimensions and adapts.
      </SectionDesc>

      <div className="mt-14 grid lg:grid-cols-[1fr,1.2fr] gap-10 items-start">
        {/* Left: Explanation */}
        <div className="space-y-8">
          {/* How it works */}
          <div>
            <h3 className="font-mono text-[11px] tracking-[0.15em] uppercase text-[#555] mb-5">How It Works</h3>
            <div className="space-y-4">
              {[
                { step: "01", title: "Observe", desc: "Each agent scans 5 operational dimensions — coverage, accuracy, efficiency, coordination, and output quality." },
                { step: "02", title: "Analyze", desc: "Calculate efficiency ratios, identify bottlenecks, detect redundant work across the swarm." },
                { step: "03", title: "Propose", desc: "Generate specific, actionable improvements with cost-benefit analysis and risk assessment." },
                { step: "04", title: "You Decide", desc: "Approve, reject, or auto-implement. Full human oversight with zero manual effort required." },
              ].map((s) => (
                <div key={s.step} className="flex gap-4 group">
                  <div className="font-mono text-[11px] text-[#00d4ff]/50 pt-0.5 shrink-0">{s.step}</div>
                  <div>
                    <div className="font-display font-semibold text-white text-[13px] mb-1 group-hover:text-[#00d4ff] transition-colors">{s.title}</div>
                    <p className="text-[12px] text-[#666] leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5 Dimensions */}
          <div>
            <h3 className="font-mono text-[11px] tracking-[0.15em] uppercase text-[#555] mb-4">5 Operational Dimensions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {dimensions.map((d) => (
                <div key={d.name} className="flex items-center gap-2 p-2.5 rounded-lg border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.02] transition-colors">
                  <DimensionIcon type={d.icon} color={d.color} />
                  <div>
                    <div className="text-[11px] text-white font-medium">{d.name}</div>
                    <div className="font-mono text-[9px] text-[#555]">{d.metric}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Differentiator */}
          <div className="p-4 rounded-lg border border-[#00d4ff]/10 bg-[#00d4ff]/[0.02]">
            <div className="font-mono text-[10px] text-[#00d4ff]/60 uppercase tracking-wider mb-2">Key Differentiator</div>
            <p className="text-[13px] text-[#999] leading-relaxed">
              This is not prompt-and-response. Agents run <span className="text-white font-medium">continuous background thinking loops</span> with
              swarm-level awareness. They see what other agents are doing, avoid redundant work, and collectively optimize
              toward the engagement goal.
            </p>
          </div>
        </div>

        {/* Right: Animated Thought Log */}
        <div className="lg:sticky lg:top-24">
          <ThoughtLog />
        </div>
      </div>
    </SectionWrapper>
  );
}
