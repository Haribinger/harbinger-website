import SectionWrapper, { SectionDesc, SectionLabel, SectionTitle } from "./SectionWrapper";

const agents = [
  { name: "PATHFINDER", role: "Recon Scout", desc: "Subdomain enumeration, port scanning, tech fingerprinting. First in, maps the terrain.", color: "#00d4ff", tools: "subfinder, httpx, naabu, shef, ceye" },
  { name: "BREACH", role: "Web Hacker", desc: "SQL injection, XSS, SSRF, auth bypass. Exploits what Recon finds.", color: "#ef4444", tools: "nuclei, sqlmap, dalfox, ffuf, recx" },
  { name: "CIPHER", role: "Binary RE", desc: "Binary analysis, memory corruption, firmware extraction, reverse engineering.", color: "#a78bfa", tools: "ghidra, radare2, pwntools, binwalk" },
  { name: "PHANTOM", role: "Cloud Infiltrator", desc: "AWS/GCP/Azure enumeration, IAM misconfigs, S3 exposure.", color: "#f59e0b", tools: "ScoutSuite, Prowler, Pacu" },
  { name: "SPECTER", role: "OSINT Detective", desc: "Email harvesting, social engineering intel, leaked credentials.", color: "#4ade80", tools: "theHarvester, Sherlock, SpiderFoot" },
  { name: "SCRIBE", role: "Report Writer", desc: "Compiles findings, generates pentest reports, evidence chains.", color: "#888", tools: "Markdown, PDF, platform APIs" },
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

export default function ArchitectureSection() {
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
            <div key={a.name} className="bg-[#0a0a0f] p-5 hover:bg-white/[0.015] transition-colors group">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: a.color }} />
                <span className="font-display font-semibold text-white text-[14px]">{a.name}</span>
              </div>
              <div className="font-mono text-[11px] mb-2" style={{ color: a.color }}>{a.role}</div>
              <p className="text-[12px] text-[#666] leading-relaxed mb-3">{a.desc}</p>
              <div className="font-mono text-[10px] text-[#444]">{a.tools}</div>
            </div>
          ))}
        </div>
      </div>

      {/* System Architecture Diagram */}
      <div className="mt-16">
        <h3 className="font-mono text-[11px] tracking-[0.15em] uppercase text-[#555] mb-6">System Architecture</h3>
        <div className="rounded-lg border border-white/[0.06] bg-[#0c0c12] p-6 font-mono text-[11px] leading-[1.8] overflow-x-auto">
          <pre className="text-[#666]">{`┌─────────────────────────────────────────────────────────────────┐
│                    `}<span className="text-[#00d4ff]">JOB ORCHESTRATOR</span>{` (Go)                       │
│  Workflow graph execution  ·  Agent lifecycle management        │
│  Scope + policy enforcement  ·  Cost governance                 │
│  Event stream (observability)  ·  Artifact store                │
└──────────────────┬──────────────────────────────────────────────┘
                   │ normalized events (JSON-RPC)
      ┌────────────┼───────────────┬───────────────┐
      ▼            ▼               ▼               ▼
  `}<span className="text-white">Web UI</span>{`       `}<span className="text-white">Channels</span>{`        `}<span className="text-white">Webhooks</span>{`        `}<span className="text-white">MCP Server</span>{`
  (React)      (Telegram/       (GitHub/        (Claude/
               Discord)         Cron)           Cursor)
      │
      ▼
┌─────────────────────────────────────────────────────────────────┐
│                  `}<span className="text-[#00d4ff]">MCP TOOL SERVERS</span>{` (Python)                      │
│  Network: nmap, masscan     ·  Web: sqlmap, nuclei, dalfox      │
│  Recon: subfinder, httpx    ·  Binary: gdb, radare2             │
│  Cloud: prowler, ScoutSuite ·  OSINT: theHarvester, sherlock    │
│  Browser: Playwright        ·  Custom user tools                │
└──────────────────┬──────────────────────────────────────────────┘
                   │
      ┌────────────┼───────────────┬───────────────┐
      ▼            ▼               ▼               ▼
  `}<span className="text-[#f59e0b]">Docker</span>{`        `}<span className="text-[#a78bfa]">Neo4j</span>{`          `}<span className="text-[#4ade80]">Git Memory</span>{`     `}<span className="text-[#ef4444]">LLM Gateway</span>{`
  Containers    Knowledge       (audit trail)   (Ollama/OpenAI/
  (isolated)    Graph                            Anthropic)`}</pre>
        </div>
      </div>

      {/* Core Components */}
      <div className="mt-16">
        <h3 className="font-mono text-[11px] tracking-[0.15em] uppercase text-[#555] mb-6">Core Components</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.04] rounded-lg overflow-hidden">
          {components.map((c) => (
            <div key={c.name} className="bg-[#0a0a0f] p-5 hover:bg-white/[0.015] transition-colors">
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
