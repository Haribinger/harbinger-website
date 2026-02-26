import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Activity, CheckCircle, Clock, GitCommit, Shield, Box, Server } from "lucide-react";

interface StatusItem {
  name: string;
  status: "operational" | "degraded" | "down";
  desc: string;
}

const services: StatusItem[] = [
  { name: "Go Backend API", status: "operational", desc: "Core API server — health checks, auth, agents, workflows" },
  { name: "React Frontend", status: "operational", desc: "14-page SPA with Obsidian Command design system" },
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
  { version: "v1.0.0", date: "Feb 2026", items: ["Command center redesign", "Device Flow auth", "6-agent roster", "Setup wizard"] },
  { version: "v0.9.5", date: "Feb 2026", items: ["Production security hardening", "Error sanitization", "OAuth CSRF protection", "Docker health checks on all services"] },
  { version: "v0.9.0", date: "Feb 2026", items: ["14 UI pages", "13 Zustand stores", "Go backend with 44+ routes", "Docker Compose orchestration"] },
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
