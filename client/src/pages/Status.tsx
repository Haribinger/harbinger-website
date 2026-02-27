import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Activity, CheckCircle, Clock, GitCommit, Shield, Box, Server, Brain, Zap } from "lucide-react";

interface StatusItem {
  name: string;
  status: "operational" | "degraded" | "down";
  desc: string;
}

const services: StatusItem[] = [
  { name: "Go Backend API", status: "operational", desc: "Core API server — health checks, auth, agents, workflows" },
  { name: "React Frontend", status: "operational", desc: "19-page SPA with Obsidian Command design system" },
  { name: "PostgreSQL + pgvector", status: "operational", desc: "Primary database with vector search support" },
  { name: "Redis", status: "operational", desc: "Cache layer and session store" },
  { name: "Neo4j Knowledge Graph", status: "operational", desc: "Entity-relationship graph for findings and intelligence" },
  { name: "Nginx Reverse Proxy", status: "operational", desc: "TLS termination, routing, security headers" },
  { name: "HexStrike MCP", status: "operational", desc: "150+ security tool MCP server" },
  { name: "PentAGI MCP", status: "operational", desc: "Autonomous agent system MCP server" },
  { name: "RedTeam MCP", status: "operational", desc: "Red team operations MCP server" },
  { name: "MCP-UI", status: "operational", desc: "Visualization and monitoring MCP server" },
];

const milestones = [
  { version: "v1.1.0", date: "Feb 2026", tag: "Latest", items: ["Autonomous Intelligence — 60s thinking loops with swarm awareness", "5-dimension operational scanning per agent", "Autonomous Dashboard — approve, reject, implement proposals", "Meta-Cognition SOUL.md for all 12 agents", "19 pages, 19 Zustand stores, 100+ backend endpoints"] },
  { version: "v1.0.0", date: "Feb 2026", tag: null, items: ["Production release — all blockers resolved", "3-method auth: OAuth + Device Flow + PAT", "11-agent roster with specialized capabilities", "Setup wizard with validation", "19-page React SPA with Obsidian Command design"] },
  { version: "v0.9.5", date: "Jan 2026", tag: null, items: ["Production security hardening", "OAuth CSRF protection + TOTP verification", "Error sanitization + Docker action whitelist", "Rate limiting + security headers (CSP, HSTS)"] },
  { version: "v0.9.0", date: "Jan 2026", tag: null, items: ["4 MCP plugin servers integrated", "Smart model router — 5 tiers, local-first", "Go backend with 44+ routes", "Docker Compose orchestration for 10 services"] },
];

const statusColor = (s: string) => s === "operational" ? "#4ade80" : s === "degraded" ? "#f59e0b" : "#ef4444";

export default function Status() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />
      <div className="container pt-24 pb-20">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Activity className="w-5 h-5 text-[#00d4ff]" />
          <h1 className="font-display text-[32px] font-bold text-white">System Status</h1>
        </div>
        <p className="text-[14px] text-[#666] mb-12 max-w-xl">
          Current health of Harbinger services and recent project milestones.
        </p>

        {/* Overall Status Banner */}
        <div className="rounded-lg border border-[#4ade80]/20 bg-[#4ade80]/5 p-4 mb-10 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-[#4ade80]" />
          <div>
            <div className="font-display font-semibold text-white text-[14px]">All Systems Operational</div>
            <div className="font-mono text-[11px] text-[#666]">10 services · Docker Compose deployment</div>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { val: "19", label: "UI Pages", icon: Box },
            { val: "11", label: "Autonomous Agents", icon: Brain },
            { val: "150+", label: "Security Tools", icon: Zap },
            { val: "100+", label: "API Endpoints", icon: Server },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-lg border border-white/[0.04] bg-white/[0.01]">
              <s.icon className="w-4 h-4 text-[#00d4ff] mb-2" />
              <div className="font-display text-xl font-bold text-white">{s.val}</div>
              <div className="font-mono text-[10px] text-[#555] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Autonomous Intelligence Status */}
        <div className="rounded-lg border border-[#a78bfa]/20 bg-[#a78bfa]/[0.03] p-4 mb-10 flex items-start gap-3">
          <Brain className="w-5 h-5 text-[#a78bfa] shrink-0 mt-0.5" />
          <div>
            <div className="font-display font-semibold text-white text-[14px]">Autonomous Intelligence Active</div>
            <div className="font-mono text-[11px] text-[#666] mt-1">
              v1.1.0 — 11 agents running 60-second thinking loops with 5-dimension scanning. Swarm-level awareness enabled. Approve/reject/implement from the Autonomous Dashboard.
            </div>
          </div>
          <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#a78bfa]/20 bg-[#a78bfa]/10 text-[#a78bfa] shrink-0">Live</span>
        </div>

        {/* Services Grid */}
        <div className="mb-16">
          <h2 className="font-mono text-[11px] tracking-[0.15em] uppercase text-[#555] mb-5 flex items-center gap-2">
            <Server className="w-3.5 h-3.5" /> Docker Services
          </h2>
          <div className="space-y-1">
            {services.map((svc) => (
              <div key={svc.name} className="flex items-center justify-between p-3 rounded-lg border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor(svc.status) }} />
                  <div>
                    <div className="font-display text-[13px] font-medium text-white">{svc.name}</div>
                    <div className="font-mono text-[10px] text-[#555]">{svc.desc}</div>
                  </div>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: statusColor(svc.status) }}>
                  {svc.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Project Health */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div>
            <h2 className="font-mono text-[11px] tracking-[0.15em] uppercase text-[#555] mb-5 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" /> Security Audit
            </h2>
            <div className="space-y-3">
              {[
                { label: "All API calls authenticated", status: true },
                { label: "Error messages sanitized", status: true },
                { label: "OAuth CSRF protection", status: true },
                { label: "TOTP verification", status: true },
                { label: "Docker action whitelist", status: true },
                { label: "Rate limiting active", status: true },
                { label: "No hardcoded secrets", status: true },
                { label: "Setup guard (prevents re-setup)", status: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2.5 text-[12px]">
                  <CheckCircle className="w-3.5 h-3.5 text-[#4ade80] shrink-0" />
                  <span className="text-[#999]">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-mono text-[11px] tracking-[0.15em] uppercase text-[#555] mb-5 flex items-center gap-2">
              <Box className="w-3.5 h-3.5" /> Build Status
            </h2>
            <div className="space-y-3">
              {[
                { label: "Frontend (Vite)", status: "passing", detail: "0 TypeScript errors" },
                { label: "Backend (Go)", status: "passing", detail: "Compiles cleanly" },
                { label: "Docker Compose", status: "passing", detail: "10/10 services up" },
                { label: "Health Checks", status: "passing", detail: "All services monitored" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-2.5 rounded border border-white/[0.04] bg-white/[0.01]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-[#4ade80]" />
                    <span className="text-[12px] text-white">{item.label}</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#555]">{item.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Release History */}
        <div>
          <h2 className="font-mono text-[11px] tracking-[0.15em] uppercase text-[#555] mb-5 flex items-center gap-2">
            <GitCommit className="w-3.5 h-3.5" /> Release History
          </h2>
          <div className="space-y-4">
            {milestones.map((m, idx) => (
              <div key={m.version} className="relative pl-8">
                {idx < milestones.length - 1 && <div className="absolute left-[7px] top-5 bottom-0 w-px bg-white/[0.06]" />}
                <div className="absolute left-0 top-[4px] w-[15px] h-[15px] rounded-full border-2 border-[#00d4ff] bg-[#0a0a0f]">
                  {idx === 0 && <div className="absolute inset-[2px] rounded-full bg-[#00d4ff]" />}
                </div>
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="font-mono text-[13px] text-[#00d4ff] font-bold">{m.version}</span>
                  {"tag" in m && m.tag && (
                    <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#00d4ff]/20 bg-[#00d4ff]/10 text-[#00d4ff]">{m.tag}</span>
                  )}
                  <span className="font-mono text-[10px] text-[#444]">{m.date}</span>
                </div>
                <div className="space-y-1">
                  {m.items.map((item) => (
                    <div key={item} className="flex items-start gap-2 text-[12px] text-[#666]">
                      <span className="text-[#333] mt-0.5 shrink-0">—</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
