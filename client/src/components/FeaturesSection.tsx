import SectionWrapper, { SectionDesc, SectionLabel, SectionTitle } from "./SectionWrapper";
import { Activity, Box, Eye, GitBranch, Globe, Lock, Network, Shield, Terminal, Users, Workflow, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const features: Feature[] = [
  { icon: Users, title: "Multi-Agent Swarm", desc: "6 specialized agents — PATHFINDER (recon), BREACH (web), CIPHER (binary), PHANTOM (cloud), SPECTER (OSINT), SCRIBE (reports) — collaborate through formal handoff protocols." },
  { icon: Workflow, title: "Workflow Graph Engine", desc: "Visual directed graph editor with parallel branches, conditions, approvals, handoffs, and retry logic. Built on @xyflow/react." },
  { icon: Terminal, title: "150+ Security Tools", desc: "Nuclei, SQLMap, Subfinder, httpx, Prowler, Nikto, dirsearch, and 140+ more — all via 4 MCP plugin servers." },
  { icon: Network, title: "MCP-First Architecture", desc: "HexStrike, PentAGI, RedTeam, and MCP-UI servers. Compatible with Claude Desktop, Cursor, and any MCP client." },
  { icon: Eye, title: "Observable by Design", desc: "14 dashboard pages, real-time WebSocket event streams, agent timeline views, graph views, cost tracking. No black boxes." },
  { icon: Lock, title: "100% Local-First", desc: "9 Docker services, pgvector, Redis, Neo4j. Runs entirely local with Ollama or LM Studio. Your data stays yours." },
  { icon: GitBranch, title: "Git Memory", desc: "Every significant event committed to a Git repo. Full auditability, replay, and GitHub Actions compute." },
  { icon: Shield, title: "Production Security", desc: "OAuth CSRF protection, TOTP verification, JWT auth, error sanitization, Docker action whitelist, rate limiting, request body limits." },
  { icon: Box, title: "Docker Isolation", desc: "Each agent runs in a fresh container with CPU/memory limits and network isolation. Configurable per-agent resource profiles." },
  { icon: Zap, title: "Setup Wizard", desc: "Guided 7-step setup: database, auth, API keys, agent config. Device Flow auth for environments where OAuth callbacks don't work." },
  { icon: Globe, title: "Multi-Channel", desc: "Control from Web UI, Telegram, Discord, GitHub webhooks, CLI, or any MCP client. One orchestrator, many surfaces." },
  { icon: Activity, title: "Persistent Learning", desc: "Episodic memory, semantic embeddings, Neo4j knowledge graph, strategic playbooks. Agents improve with every engagement." },
];

export default function FeaturesSection() {
  return (
    <SectionWrapper id="features">
      <SectionLabel>Capabilities</SectionLabel>
      <SectionTitle>Everything you need. Nothing you don't.</SectionTitle>
      <SectionDesc>
        Built for professionals who need orchestrated workflows, full visibility, and local-first operation.
      </SectionDesc>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px mt-14 bg-white/[0.04] rounded-lg overflow-hidden">
        {features.map((f) => (
          <div key={f.title} className="bg-[#0a0a0f] p-6 hover:bg-white/[0.015] transition-colors group">
            <f.icon className="w-4 h-4 text-[#555] mb-4 group-hover:text-[#00d4ff] transition-colors" />
            <h3 className="font-display font-semibold text-white text-[14px] mb-2">{f.title}</h3>
            <p className="text-[12px] text-[#666] leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
