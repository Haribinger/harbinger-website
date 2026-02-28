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
    id: "1.1", title: "Autonomous Intelligence", weeks: "Weeks 4–5", tagline: "Shipped. Self-optimizing agents with continuous thinking loops.",
    status: "completed",
    items: [
      "✓ 60-second autonomous thinking loops for all agents",
      "✓ 5-dimension operational scanning (coverage, accuracy, efficiency, coordination, quality)",
      "✓ Swarm-level awareness — agents see what other agents are doing",
      "✓ Efficiency tracking with cost-benefit analysis",
      "✓ Autonomous Dashboard — approve, reject, implement proposals",
      "✓ Meta-Cognition SOUL.md — all 12 agents with self-awareness and auto-handoff",
      "✓ Agent self-tuning based on engagement history",
      "✓ Cross-agent optimization recommendations",
    ],
  },
  {
    id: "1.2", title: "Agent Swarm & Docker Orchestration", weeks: "Weeks 5–6", tagline: "Shipped. Real Docker container orchestration with 5 security tool images.",
    status: "completed",
    items: [
      "✓ Go backend with Chi router, JWT auth, rate limiting, audit logging",
      "✓ Docker SDK orchestration — real container spawning with resource limits (512MB/1CPU)",
      "✓ 5 Docker security tool images (recon, scanner, cloud, osint, exploit)",
      "✓ Real tools: subfinder, nuclei, httpx, prowler, shodan, impacket, sqlmap, nikto, amass",
      "✓ WebSocket hub — live scan events streamed to subscribed clients",
      "✓ Credit system with Stripe Checkout integration",
      "✓ Domain validation with SSRF prevention (blocks localhost, private IPs, RFC1918)",
      "✓ JSONL audit trail with cryptographic IDs",
      "✓ Kubernetes manifests (namespace, deployments, ingress, StatefulSet)",
    ],
  },
  {
    id: "1.3", title: "Realtime, Learning & Safety", weeks: "Weeks 6–7", tagline: "Shipped. SSE streaming, technique scoring, safety guardrails.",
    status: "completed",
    items: [
      "✓ SSE event streaming — 1,000-event ring buffer, per-channel fan-out, sub-100ms latency",
      "✓ Multi-operator sessions — admin, operator, observer roles with live tracking",
      "✓ Global kill switch — instant halt of all operations via SSE broadcast",
      "✓ Technique scoring — success/failure/detection rates, platform filtering, rolling averages",
      "✓ Campaign tracking — timeline events, auto-progress, per-step success/failure/detection",
      "✓ LOL discovery pipeline — auto-discover techniques, pending → approved/rejected review",
      "✓ AI recommendation engine — 4 heuristics: success picks, evasion alerts, chain templates, gap analysis",
      "✓ Target validation — 8 built-in rules blocking RFC1918, loopback, cloud metadata, link-local",
      "✓ Scope enforcement — include/exclude with exclude-always-wins model",
      "✓ Audit trail — 10,000-entry ring buffer with severity, filtering, export",
      "✓ Approval workflows — pending → approved/rejected, 24h auto-expiry",
      "✓ 120 new API routes (realtime + learning + safety × dual prefix)",
    ],
  },
  {
    id: "1.5", title: "Platform UI & Agent Fleet", weeks: "Weeks 7–8", tagline: "Shipped. 12 pages, 45 agents, mission control dashboard.",
    status: "completed",
    items: [
      "✓ 12-page React SPA — Home, Demo, Scan, Docs, Status, Pricing, Auth, Dashboard, Settings, Scan Results, Mission Control, 404",
      "✓ User Dashboard — scan history, findings distribution, credit charts, quick actions",
      "✓ Settings — profile, API keys, webhooks, notifications, security (2FA), appearance (themes)",
      "✓ Scan Results — expandable finding cards, severity filters, search, evidence copy, export",
      "✓ Mission Control — private pipeline dashboard with 45-agent grid and health scores",
      "✓ Notification system — real-time bell with unread badges and severity types",
      "✓ 45 Claude Code agents (7 automation + 6 workflow + 32 specialist)",
      "✓ Master orchestrator — dependency-aware pipeline: fix → enhance → security → perf → test → docs → ship",
      "✓ 26 backend API endpoints covering auth, scans, credits, dashboard, keys, webhooks, findings, reports",
    ],
  },
  {
    id: "2.0", title: "Database Persistence", weeks: "Weeks 7–9", tagline: "Current. PostgreSQL integration for users, scans, and findings.",
    status: "active",
    items: [
      "✓ PostgreSQL schema defined (users, scans, findings, containers, audit_log, credit_transactions)",
      "✓ Docker Compose with PostgreSQL + Redis services",
      "Connect Go backend to PostgreSQL (replace in-memory stores)",
      "User persistence — signup, login, API key storage",
      "Scan persistence — history, findings, evidence",
      "Credit transaction logging",
      "Database migrations with versioning",
      "Connection pooling and query optimization",
    ],
  },
  {
    id: "2.5", title: "Production Hardening", weeks: "Weeks 9–11", tagline: "SSL, monitoring, cost controls, observability.",
    status: "upcoming",
    items: [
      "✓ Rate limiting on API endpoints (sliding window per-IP)",
      "✓ Health checks for all services",
      "✓ Security headers — CSP, HSTS, X-Frame-Options",
      "HTTPS via Let's Encrypt or custom certs",
      "Structured logging (replace log.Printf with slog)",
      "Prometheus metrics + Grafana dashboard",
      "Cost governance layer (per-agent token budgets, runtime limits)",
      "Resource usage panel in UI (CPU, memory, network per container)",
      "Automated backup and disaster recovery",
    ],
  },
  {
    id: "3.0", title: "Real Agent Execution", weeks: "Weeks 11–14", tagline: "Wire Docker containers to real scan output parsing.",
    status: "upcoming",
    items: [
      "Container output parsing — structured findings from tool stdout",
      "Tool configuration management (nuclei templates, wordlists, custom configs)",
      "Scan scheduling — recurring scans with cron expressions",
      "PDF report generation with executive summary",
      "Webhook delivery system — POST scan results to configured endpoints",
      "CVSS scoring integration",
      "Jira/GitHub issue creation from findings",
    ],
  },
  {
    id: "4.0", title: "Persistent Learning", weeks: "Weeks 14–18", tagline: "Deep memory and cross-session intelligence.",
    status: "future",
    items: [
      "✓ Session context — agent state preserved during lifecycle",
      "✓ SAGE learning agent — nightly optimization, pattern learning",
      "✓ Technique scoring engine — success/detection rates, platform-aware",
      "✓ AI recommendation engine — 4 heuristics for technique selection",
      "✓ Campaign tracking with per-step analysis",
      "Episodic memory (job summaries across sessions)",
      "Semantic memory (pgvector embedding index)",
      "Strategic memory (playbooks from successful engagements)",
      "Finding deduplication and correlation across scans",
      "Attack surface trending over time",
    ],
  },
  {
    id: "5.0", title: "Knowledge Graph & Community", weeks: "Weeks 18–24", tagline: "Collective intelligence and ecosystem.",
    status: "future",
    items: [
      "✓ Neo4j configured in Docker Compose",
      "Full Neo4j knowledge graph — entity/relation CRUD",
      "HowToHunt methodology ingestion",
      "Community contribution portal",
      "Plugin marketplace",
      "Nuclei Template IDE",
      "Competitive agents mode (best result wins)",
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
