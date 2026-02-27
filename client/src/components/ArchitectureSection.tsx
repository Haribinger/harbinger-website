import { useState } from "react";
import SectionWrapper, { SectionDesc, SectionLabel, SectionTitle } from "./SectionWrapper";

const agents = [
  { name: "PATHFINDER", role: "Recon Scout", desc: "Subdomain enumeration, port scanning, tech fingerprinting. First in, maps the terrain.", color: "#00d4ff", tools: ["subfinder", "httpx", "naabu", "shef", "ceye"], icon: "radar" },
  { name: "BREACH", role: "Web Hacker", desc: "SQL injection, XSS, SSRF, auth bypass. Exploits what Recon finds.", color: "#ef4444", tools: ["nuclei", "sqlmap", "dalfox", "ffuf", "recx"], icon: "target" },
  { name: "CIPHER", role: "Binary RE", desc: "Binary analysis, memory corruption, firmware extraction, reverse engineering.", color: "#a78bfa", tools: ["ghidra", "radare2", "pwntools", "binwalk"], icon: "cpu" },
  { name: "PHANTOM", role: "Cloud Infiltrator", desc: "AWS/GCP/Azure enumeration, IAM misconfigs, S3 exposure.", color: "#f59e0b", tools: ["ScoutSuite", "Prowler", "Pacu"], icon: "cloud" },
  { name: "SPECTER", role: "OSINT Detective", desc: "Email harvesting, social engineering intel, leaked credentials.", color: "#4ade80", tools: ["theHarvester", "Sherlock", "SpiderFoot"], icon: "eye" },
  { name: "SCRIBE", role: "Report Writer", desc: "Compiles findings, generates pentest reports, evidence chains.", color: "#888", tools: ["Markdown", "PDF", "platform APIs"], icon: "file" },
];

const components = [
  { name: "Job Orchestrator", tech: "Go", desc: "Central workflow engine — lifecycle management, event dispatch, cost governance, scope enforcement" },
  { name: "MCP Tool Servers", tech: "Python", desc: "150+ security tools exposed via Model Context Protocol for any MCP-compatible client" },
  { name: "Agent Runtime", tech: "Go/Python", desc: "Pluggable agent runtimes with standardized interface — init, plan, execute, emit, handoff" },
  { name: "Knowledge Graph", tech: "Neo4j", desc: "Semantic memory of entities, relationships, techniques from past engagements" },
  { name: "Git Memory", tech: "Node.js", desc: "Every significant event committed to Git for full auditability and replay" },
  { name: "LLM Gateway", tech: "Go", desc: "Supports Ollama, LM Studio, OpenAI, Anthropic, Gemini — your choice, your keys" },
  { name: "Tool Runner", tech: "Docker", desc: "Each tool runs in a fresh container with resource limits and network isolation" },
  { name: "Web UI", tech: "React", desc: "DevOps-style dashboard with timelines, graph views, artifact viewer, cost panels" },
];

const orchestratorFeatures = [
  "Workflow graph execution",
  "Agent lifecycle management",
  "Scope + policy enforcement",
  "Cost governance",
  "Event stream (observability)",
  "Artifact store",
];

const channels = [
  { name: "Web UI", sub: "React", color: "#00d4ff" },
  { name: "Channels", sub: "Telegram / Discord", color: "#a78bfa" },
  { name: "Webhooks", sub: "GitHub / Cron", color: "#f59e0b" },
  { name: "MCP Server", sub: "Claude / Cursor", color: "#4ade80" },
];

const toolCategories = [
  { label: "Network", tools: "nmap, masscan", color: "#00d4ff" },
  { label: "Web", tools: "sqlmap, nuclei, dalfox", color: "#ef4444" },
  { label: "Recon", tools: "subfinder, httpx", color: "#00d4ff" },
  { label: "Binary", tools: "gdb, radare2", color: "#a78bfa" },
  { label: "Cloud", tools: "prowler, ScoutSuite", color: "#f59e0b" },
  { label: "OSINT", tools: "theHarvester, sherlock", color: "#4ade80" },
  { label: "Browser", tools: "Playwright", color: "#3b82f6" },
  { label: "Custom", tools: "user tools", color: "#888" },
];

const infrastructure = [
  { name: "Docker", sub: "Containers (isolated)", color: "#f59e0b", icon: "box" },
  { name: "Neo4j", sub: "Knowledge Graph", color: "#a78bfa", icon: "graph" },
  { name: "Git Memory", sub: "Audit trail", color: "#4ade80", icon: "git" },
  { name: "LLM Gateway", sub: "Ollama / OpenAI / Anthropic", color: "#ef4444", icon: "brain" },
];

function AgentIcon({ type, color }: { type: string; color: string }) {
  const props = { width: 18, height: 18, fill: "none", stroke: color, strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (type) {
    case "radar": return <svg {...props} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 12l4.2-4.2" /><circle cx="12" cy="12" r="3" opacity=".5" /><circle cx="12" cy="12" r="6" opacity=".3" /></svg>;
    case "target": return <svg {...props} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" fill={color} /><path d="M12 3v4M12 17v4M3 12h4M17 12h4" /></svg>;
    case "cpu": return <svg {...props} viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="2" /><path d="M9 1v4M15 1v4M9 19v4M15 19v4M1 9h4M1 15h4M19 9h4M19 15h4" /></svg>;
    case "cloud": return <svg {...props} viewBox="0 0 24 24"><path d="M6.5 19a4.5 4.5 0 01-.42-8.98A7 7 0 0119.5 11a4.5 4.5 0 01-.5 8.97" /><path d="M12 13v6M9 17l3 3 3-3" opacity=".6" /></svg>;
    case "eye": return <svg {...props} viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>;
    case "file": return <svg {...props} viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="13" y2="17" /></svg>;
    default: return null;
  }
}

function InfraIcon({ type, color }: { type: string; color: string }) {
  const props = { width: 20, height: 20, fill: "none", stroke: color, strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (type) {
    case "box": return <svg {...props} viewBox="0 0 24 24"><path d="M21 8V16a2 2 0 01-2 2H5a2 2 0 01-2-2V8" /><rect x="1" y="4" width="22" height="4" rx="1" /><path d="M10 12h4" /></svg>;
    case "graph": return <svg {...props} viewBox="0 0 24 24"><circle cx="6" cy="6" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="6" cy="18" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="M8.5 7l7 0M8.5 17l7 0M6 8.5v7M18 8.5v7" opacity=".5" /></svg>;
    case "git": return <svg {...props} viewBox="0 0 24 24"><circle cx="12" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="18" r="3" /><path d="M12 9v3M8.5 16.5L11 12M15.5 16.5L13 12" /></svg>;
    case "brain": return <svg {...props} viewBox="0 0 24 24"><path d="M12 2a7 7 0 017 7c0 2.4-1.2 4.5-3 5.7V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.3C6.2 13.5 5 11.4 5 9a7 7 0 017-7z" /><path d="M9 21h6M10 17v4M14 17v4" opacity=".5" /></svg>;
    default: return null;
  }
}

function FlowArrow({ className = "" }: { className?: string }) {
  return (
    <div className={`flex justify-center ${className}`}>
      <div className="relative flex flex-col items-center">
        <div className="w-px h-8 bg-gradient-to-b from-[#00d4ff]/40 to-[#00d4ff]/10" />
        <svg width="10" height="6" viewBox="0 0 10 6" className="text-[#00d4ff]/40">
          <path d="M0 0L5 6L10 0" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}

function FlowLabel({ children }: { children: string }) {
  return (
    <div className="flex justify-center my-1">
      <span className="font-mono text-[10px] text-[#00d4ff]/50 tracking-wider uppercase px-3 py-1 rounded-full border border-[#00d4ff]/10 bg-[#00d4ff]/[0.03]">
        {children}
      </span>
    </div>
  );
}

function PulsingDot({ color, size = 6 }: { color: string; size?: number }) {
  return (
    <span className="relative inline-flex">
      <span
        className="absolute inline-flex h-full w-full rounded-full opacity-40 animate-ping"
        style={{ backgroundColor: color, animationDuration: "2s" }}
      />
      <span
        className="relative inline-flex rounded-full"
        style={{ backgroundColor: color, width: size, height: size }}
      />
    </span>
  );
}

export default function ArchitectureSection() {
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  return (
    <SectionWrapper id="architecture">
      <SectionLabel>Architecture</SectionLabel>
      <SectionTitle>A swarm at your command.</SectionTitle>
      <SectionDesc>
        Specialized agents with distinct capabilities, orchestrated through a central command layer. Each agent operates autonomously but reports every action back to you.
      </SectionDesc>

      {/* Agent Swarm */}
      <div className="mt-16">
        <h3 className="font-mono text-[11px] tracking-[0.15em] uppercase text-[#555] mb-6">Agent Swarm</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.04] rounded-lg overflow-hidden">
          {agents.map((a) => (
            <button
              key={a.name}
              onClick={() => setExpandedAgent(expandedAgent === a.name ? null : a.name)}
              className="bg-[#0a0a0f] p-5 hover:bg-white/[0.02] transition-all duration-300 group text-left relative overflow-hidden"
            >
              {/* Glow effect on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at 50% 0%, ${a.color}08 0%, transparent 70%)`,
                }}
              />

              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg border border-white/[0.06] bg-white/[0.02] group-hover:border-white/[0.1] transition-colors" style={{ borderColor: expandedAgent === a.name ? `${a.color}30` : undefined }}>
                    <AgentIcon type={a.icon} color={a.color} />
                  </div>
                  <div>
                    <span className="font-display font-semibold text-white text-[14px] block">{a.name}</span>
                    <span className="font-mono text-[10px]" style={{ color: a.color }}>{a.role}</span>
                  </div>
                  <div className="ml-auto">
                    <PulsingDot color={a.color} />
                  </div>
                </div>
                <p className="text-[12px] text-[#666] leading-relaxed mb-3">{a.desc}</p>

                {/* Expanded tools */}
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: expandedAgent === a.name ? "80px" : "20px" }}
                >
                  <div className="flex flex-wrap gap-1.5">
                    {a.tools.map((t) => (
                      <span
                        key={t}
                        className="font-mono text-[10px] px-2 py-0.5 rounded border transition-colors duration-300"
                        style={{
                          borderColor: expandedAgent === a.name ? `${a.color}30` : "rgba(255,255,255,0.06)",
                          color: expandedAgent === a.name ? a.color : "#555",
                          backgroundColor: expandedAgent === a.name ? `${a.color}08` : "transparent",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* System Architecture Diagram — Visual */}
      <div className="mt-20">
        <h3 className="font-mono text-[11px] tracking-[0.15em] uppercase text-[#555] mb-8">System Architecture</h3>

        <div className="space-y-0">
          {/* Layer 1: Job Orchestrator */}
          <div className="rounded-xl border border-[#00d4ff]/20 bg-gradient-to-b from-[#00d4ff]/[0.04] to-transparent p-6 relative overflow-hidden">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-16 h-px bg-gradient-to-r from-[#00d4ff]/60 to-transparent" />
            <div className="absolute top-0 left-0 w-px h-16 bg-gradient-to-b from-[#00d4ff]/60 to-transparent" />
            <div className="absolute top-0 right-0 w-16 h-px bg-gradient-to-l from-[#00d4ff]/60 to-transparent" />
            <div className="absolute top-0 right-0 w-px h-16 bg-gradient-to-b from-[#00d4ff]/60 to-transparent" />

            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#00d4ff] shadow-[0_0_8px_#00d4ff80]" />
              <h4 className="font-display font-bold text-white text-[16px] tracking-tight">JOB ORCHESTRATOR</h4>
              <span className="font-mono text-[11px] text-[#00d4ff]/70 ml-1">Go</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {orchestratorFeatures.map((f) => (
                <div key={f} className="flex items-center gap-2 text-[12px] text-[#888]">
                  <span className="text-[#00d4ff]/50">&#x25AA;</span>
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Flow: Orchestrator -> Channels */}
          <FlowArrow />
          <FlowLabel>normalized events (JSON-RPC)</FlowLabel>
          <FlowArrow />

          {/* Layer 2: Output Channels */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.04] rounded-lg overflow-hidden">
            {channels.map((ch) => (
              <div key={ch.name} className="bg-[#0a0a0f] p-4 text-center hover:bg-white/[0.015] transition-colors group">
                <div className="w-10 h-10 rounded-lg border border-white/[0.06] mx-auto mb-3 flex items-center justify-center group-hover:border-white/[0.12] transition-colors" style={{ borderColor: `${ch.color}15` }}>
                  <div className="w-3 h-3 rounded-full opacity-60" style={{ backgroundColor: ch.color }} />
                </div>
                <div className="font-display font-semibold text-white text-[13px]">{ch.name}</div>
                <div className="font-mono text-[10px] text-[#555] mt-1">{ch.sub}</div>
              </div>
            ))}
          </div>

          {/* Flow: Channels -> MCP Tool Servers */}
          <FlowArrow />

          {/* Layer 3: MCP Tool Servers */}
          <div className="rounded-xl border border-[#a78bfa]/15 bg-gradient-to-b from-[#a78bfa]/[0.03] to-transparent p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-16 h-px bg-gradient-to-r from-[#a78bfa]/40 to-transparent" />
            <div className="absolute top-0 left-0 w-px h-16 bg-gradient-to-b from-[#a78bfa]/40 to-transparent" />
            <div className="absolute top-0 right-0 w-16 h-px bg-gradient-to-l from-[#a78bfa]/40 to-transparent" />
            <div className="absolute top-0 right-0 w-px h-16 bg-gradient-to-b from-[#a78bfa]/40 to-transparent" />

            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#a78bfa] shadow-[0_0_8px_#a78bfa80]" />
              <h4 className="font-display font-bold text-white text-[16px] tracking-tight">MCP TOOL SERVERS</h4>
              <span className="font-mono text-[11px] text-[#a78bfa]/70 ml-1">Python</span>
              <span className="ml-auto font-mono text-[10px] text-[#555] border border-white/[0.06] rounded-full px-2.5 py-0.5">150+ tools</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {toolCategories.map((cat) => (
                <div key={cat.label} className="flex items-start gap-2 text-[12px]">
                  <span className="mt-0.5 shrink-0 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color, opacity: 0.6 }} />
                  <div>
                    <span style={{ color: cat.color }} className="font-mono text-[10px] font-medium">{cat.label}</span>
                    <span className="text-[#666] ml-1">{cat.tools}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Flow: MCP -> Infrastructure */}
          <FlowArrow />

          {/* Layer 4: Infrastructure */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.04] rounded-lg overflow-hidden">
            {infrastructure.map((inf) => (
              <div key={inf.name} className="bg-[#0a0a0f] p-5 hover:bg-white/[0.015] transition-colors group relative overflow-hidden">
                <div
                  className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `linear-gradient(90deg, transparent, ${inf.color}40, transparent)` }}
                />
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg border border-white/[0.06] flex items-center justify-center group-hover:border-white/[0.1] transition-colors" style={{ borderColor: `${inf.color}15` }}>
                    <InfraIcon type={inf.icon} color={inf.color} />
                  </div>
                  <div>
                    <div className="font-display font-semibold text-white text-[13px]" style={{ color: inf.color }}>{inf.name}</div>
                    <div className="font-mono text-[10px] text-[#555]">{inf.sub}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Core Components */}
      <div className="mt-20">
        <h3 className="font-mono text-[11px] tracking-[0.15em] uppercase text-[#555] mb-6">Core Components</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.04] rounded-lg overflow-hidden">
          {components.map((c) => (
            <div key={c.name} className="bg-[#0a0a0f] p-5 hover:bg-white/[0.015] transition-colors group relative">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00d4ff]/0 group-hover:via-[#00d4ff]/20 to-transparent transition-all duration-500" />
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-display font-semibold text-white text-[13px]">{c.name}</span>
                <span className="font-mono text-[10px] text-[#00d4ff]">{c.tech}</span>
              </div>
              <p className="text-[12px] text-[#666] leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
