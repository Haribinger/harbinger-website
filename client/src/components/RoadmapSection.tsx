import SectionWrapper, { SectionDesc, SectionLabel, SectionTitle } from "./SectionWrapper";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Phase {
  id: string;
  title: string;
  weeks: string;
  tagline: string;
  status: "completed" | "active" | "upcoming" | "future";
  items: string[];
}

const phases: Phase[] = [
  {
    id: "0.9", title: "Agent Runtime MVP", weeks: "Weeks 1–3", tagline: "Shipped. Agent-to-agent workflows — observable, composable, autonomous.",
    status: "completed",
    items: [
      "✓ Agent Runtime Interface (start_session, dispatch_task, stream_events)",
      "✓ Workflow Graph Model (6 node types: agent, tool, condition, approval, handoff, output)",
      "✓ Observability Events (agentStatusChange, taskHandoff, findingsShared, autonomousThought)",
      "✓ PentAGI Adapter (registered as MCP plugin)",
      "✓ UI: Command Center timeline + Workflow Editor graph + cost panel",
      "✓ Autonomous Intelligence — 60s thinking loops, swarm awareness, efficiency tracking",
      "✓ Meta-Cognition SOUL.md — all 12 agents with self-awareness and auto-handoff",
      "✓ Autonomous Dashboard — thought log, proposals, charts, approve/reject/implement",
    ],
  },
  {
    id: "1.0", title: "Production Blockers", weeks: "Weeks 3–4", tagline: "Shipped. All production blockers resolved.",
    status: "completed",
    items: [
      "✓ Docker Compose — all ports configurable via env vars, health checks on every service",
      "✓ Frontend — API proxy in both Vite dev server and production nginx container",
      "✓ Backend — JWT secret validation, error message sanitization, OAuth CSRF protection",
      "✓ Auth — 3-method login (OAuth, Device Flow, PAT), setup wizard with validation",
      "✓ Security — TOTP verification, Docker action whitelist, request body limits, rate limiting",
      "✓ All API calls authenticated with Bearer tokens",
      "✓ 19 pages, 19 Zustand stores, 15 API modules, 100+ backend endpoints",
    ],
  },
  {
    id: "1.1", title: "Autonomous Intelligence", weeks: "Weeks 4–5", tagline: "Current. Self-optimizing agents with continuous thinking loops.",
    status: "active",
    items: [
      "✓ 60-second autonomous thinking loops for all agents",
      "✓ 5-dimension operational scanning (coverage, accuracy, efficiency, coordination, quality)",
      "✓ Swarm-level awareness — agents see what other agents are doing",
      "✓ Efficiency tracking with cost-benefit analysis",
      "✓ Autonomous Dashboard — approve, reject, implement proposals",
      "✓ Meta-Cognition SOUL.md — all 12 agents with self-awareness and auto-handoff",
      "Agent self-tuning based on engagement history",
      "Cross-agent optimization recommendations",
    ],
  },
  {
    id: "1.2", title: "Red Team C2 & LOL", weeks: "Weeks 5–6", tagline: "Current. Full C2 infrastructure and 28 LOL project integration.",
    status: "active",
    items: [
      "✓ C2 framework management — Mythic, Sliver, Havoc, Cobalt Strike, Custom",
      "✓ Listener management — HTTP/S, TCP, SMB, DNS, WebSocket, Named Pipe",
      "✓ Payload generation — EXE, DLL, Shellcode, PS1, HTA, MSI, Office Macro",
      "✓ Implant tracking — real-time status, integrity levels, sleep/jitter",
      "✓ 28 LOL projects integrated from lolol.farm (3,000+ entries)",
      "✓ Attack chain builder — compose LOL entries with C2 commands",
      "✓ MITRE ATT&CK heatmap — technique coverage visualization",
      "Real-time agent coordination and live command streaming",
      "Agent learning — success/failure tracking, technique scoring",
      "Safety controls — target validation, scope enforcement, kill switch",
    ],
  },
  {
    id: "1.5", title: "CLI Onboarding", weeks: "Weeks 6–7", tagline: "Skills shipped. CLI commands next.",
    status: "active",
    items: [
      "✓ harbinger-healthcheck skill — full codebase health scanning",
      "✓ harbinger-maintain skill — dependency updates, cleanup",
      "✓ harbinger-bugfix skill — debug workflow, build checks",
      "✓ harbinger-scaffold skill — generate new pages, stores, handlers",
      "✓ harbinger-feature-deploy skill — plan, build, ship pipeline",
      "✓ harbinger-website-sync skill — sync website, docs, roadmap",
      "harbinger onboard CLI (--quick, --advanced, --non-interactive)",
      "harbinger configure CLI (platform, channels, agent)",
      "harbinger doctor CLI (--prod mode)",
    ],
  },
  {
    id: "2.0", title: "Production Hardening", weeks: "Weeks 5–7", tagline: "SSL, monitoring, cost controls — partially complete.",
    status: "upcoming",
    items: [
      "✓ Rate limiting on API endpoints (sliding window per-IP)",
      "✓ Health checks for all services (postgres, redis, neo4j, backend, MCP plugins)",
      "✓ Security headers — CSP, HSTS, X-Frame-Options",
      "✓ Smart model router — cost optimization, 5 tiers, local-first",
      "HTTPS via Let's Encrypt or custom certs",
      "Cost governance layer (per-agent token budgets, runtime limits)",
      "Resource usage panel in UI (CPU, memory, network per container)",
    ],
  },
  {
    id: "3.0", title: "Hybrid Architecture", weeks: "Weeks 7–10", tagline: "Registry-based channels, plugin SDK, clean dispatch.",
    status: "upcoming",
    items: [
      "✓ Channel system — Discord, Telegram, Slack configuration and webhooks",
      "✓ Agent communication bus — broadcast, messages, shared context",
      "✓ OpenClaw event bus — command routing, skill listing",
      "Channel registry (all channels as plugins)",
      "Orchestrator dispatch(event) pattern",
      "Plugin Development Kit + loader",
    ],
  },
  {
    id: "4.0", title: "Persistent Learning", weeks: "Weeks 10–14", tagline: "Agents that learn and improve over time.",
    status: "future",
    items: [
      "✓ Session context — agent state preserved during lifecycle",
      "✓ SAGE learning agent — nightly optimization, pattern learning",
      "✓ Autonomous thinking loops — continuous self-improvement",
      "Episodic memory (job summaries across sessions)",
      "Semantic memory (pgvector embedding index)",
      "Strategic memory (playbooks from successful engagements)",
      "Git Memory module (commit every significant event)",
    ],
  },
  {
    id: "5.0", title: "Knowledge Graph", weeks: "Weeks 14–18", tagline: "Collective intelligence and community contributions.",
    status: "future",
    items: [
      "✓ Neo4j configured in Docker Compose",
      "✓ Swarm state API for collective awareness",
      "Full Neo4j knowledge graph — entity/relation CRUD",
      "HowToHunt methodology ingestion",
      "Community contribution portal",
      "Agent Capability Matrix",
    ],
  },
  {
    id: "6.0", title: "Advanced Features", weeks: "Weeks 18–24", tagline: "Competitive agents, consensus mode, marketplace.",
    status: "future",
    items: [
      "Competitive agents mode (best result wins)",
      "Consensus verification mode",
      "Advanced MCP-UI components",
      "Plugin marketplace website",
      "MCP Registry submission (hexstrike, idor-mcp)",
      "Nuclei Template IDE",
    ],
  },
];

function PhaseCard({ phase }: { phase: Phase }) {
  const [open, setOpen] = useState(phase.status === "active");
  const statusColor = phase.status === "completed" ? "#4ade80" : phase.status === "active" ? "#00d4ff" : phase.status === "upcoming" ? "#f59e0b" : "#333";

  return (
    <div className="relative pl-8 pb-8 last:pb-0">
      {/* Timeline line */}
      <div className="absolute left-[7px] top-3 bottom-0 w-px bg-white/[0.06]" />
      {/* Timeline dot */}
      <div
        className="absolute left-0 top-[6px] w-[15px] h-[15px] rounded-full border-2 bg-[#0a0a0f]"
        style={{ borderColor: statusColor }}
      >
        {(phase.status === "active" || phase.status === "completed") && (
          <div className="absolute inset-[2px] rounded-full" style={{ backgroundColor: statusColor }} />
        )}
      </div>

      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left group"
      >
        <div className="flex items-baseline gap-3 mb-1 flex-wrap">
          <span className="font-mono text-[11px]" style={{ color: statusColor }}>Phase {phase.id}</span>
          <span className="font-display font-semibold text-white text-[15px] group-hover:text-[#00d4ff] transition-colors">{phase.title}</span>
          {phase.status === "completed" && (
            <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#4ade80]/20 bg-[#4ade80]/10 text-[#4ade80]">Shipped</span>
          )}
          {phase.status === "active" && (
            <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#00d4ff]/20 bg-[#00d4ff]/10 text-[#00d4ff]">Current</span>
          )}
          <span className="font-mono text-[10px] text-[#444] hidden sm:inline">{phase.weeks}</span>
          <ChevronDown className={cn("w-3.5 h-3.5 text-[#444] ml-auto transition-transform", open && "rotate-180")} />
        </div>
        <p className="text-[12px] text-[#666]">{phase.tagline}</p>
      </button>

      {open && (
        <div className="mt-3 space-y-1.5">
          {phase.items.map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-[12px] text-[#555]">
              <span className="text-[#333] mt-0.5 shrink-0">—</span>
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RoadmapSection() {
  return (
    <SectionWrapper id="roadmap">
      <SectionLabel>Roadmap</SectionLabel>
      <SectionTitle>From MVP to platform.</SectionTitle>
      <SectionDesc>
        A phased approach: ship the agent runtime first, harden for production, then build the ecosystem.
      </SectionDesc>

      <div className="mt-14 max-w-2xl">
        {phases.map((p) => (
          <PhaseCard key={p.id} phase={p} />
        ))}
      </div>
    </SectionWrapper>
  );
}
