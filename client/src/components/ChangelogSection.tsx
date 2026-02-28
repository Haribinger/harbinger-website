import SectionWrapper, { SectionDesc, SectionLabel, SectionTitle } from "./SectionWrapper";

interface ChangelogEntry {
  date: string;
  version: string;
  tag: "feature" | "security" | "agent" | "mcp" | "improvement";
  title: string;
  description: string;
  highlights: string[];
}

const entries: ChangelogEntry[] = [
  {
    date: "Feb 2026",
    version: "v1.6.0",
    tag: "feature",
    title: "Realtime Collaboration, Agent Learning & Safety Controls",
    description: "Three new backend subsystems with full frontend integration: SSE realtime streaming with multi-operator sessions, technique scoring and AI recommendation engine, and safety guardrails with target validation, scope enforcement, and approval workflows.",
    highlights: [
      "SSE event streaming with 1,000-event ring buffer and per-channel fan-out",
      "Agent learning engine — technique scoring, campaign tracking, LOL discovery pipeline, AI recommendations",
      "Safety controls — 8 built-in target validation rules, scope enforcement, rate limiting, 10K audit trail",
      "120 new API routes across realtime, learning, and safety subsystems",
    ],
  },
  {
    date: "Feb 2026",
    version: "v1.5.0",
    tag: "feature",
    title: "Platform UI, Agent Fleet & Mission Control",
    description: "Massive expansion: 12 pages, 45 automation agents, Mission Control dashboard, user dashboard, settings with API keys and webhooks, scan results viewer, notification system, and 26 backend API endpoints.",
    highlights: [
      "45 Claude Code agents — 7 automation, 6 workflow, 32 specialist",
      "Mission Control — private orchestration dashboard with pipeline runner",
      "Dashboard, Settings, Scan Results, Notifications — full user experience",
      "26 API endpoints — dashboard stats, API keys, webhooks, findings, reports",
    ],
  },
  {
    date: "Feb 2026",
    version: "v1.2.0",
    tag: "agent",
    title: "Agent Swarm & Docker Orchestration",
    description: "Production agent swarm with real Docker container orchestration. Go backend with Docker SDK, 5 security tool images, WebSocket streaming, Stripe credits, Kubernetes manifests, and SSRF-safe domain validation.",
    highlights: [
      "Docker SDK orchestration — real containers with resource limits",
      "5 tool images: recon (subfinder, nmap), scanner (nuclei, sqlmap), cloud (prowler), osint (shodan), exploit (impacket)",
      "WebSocket hub for live scan event streaming",
      "Kubernetes deployment manifests and build scripts",
    ],
  },
  {
    date: "Feb 2026",
    version: "v1.1.0",
    tag: "agent",
    title: "Autonomous Intelligence",
    description: "Every agent now runs continuous 60-second thinking loops with swarm-level awareness. Self-optimizing background cognition that analyzes performance, identifies improvements, and proposes automations.",
    highlights: [
      "5-dimension operational scanning per agent",
      "Autonomous dashboard with approve/reject/implement",
      "Meta-Cognition SOUL.md for all 12 agents",
      "Efficiency tracking and cost-benefit analysis",
    ],
  },
  {
    date: "Feb 2026",
    version: "v1.0.0",
    tag: "feature",
    title: "Production Release",
    description: "Full production deployment with 19 pages, 19 Zustand stores, 100+ backend endpoints, and 3-method authentication. All production blockers resolved.",
    highlights: [
      "OAuth + Device Flow + PAT authentication",
      "Setup wizard with validation",
      "19-page React SPA with Obsidian Command design",
      "Docker Compose with health checks on all 10 services",
    ],
  },
  {
    date: "Jan 2026",
    version: "v0.9.5",
    tag: "security",
    title: "Security Hardening",
    description: "Comprehensive security audit and hardening pass. OAuth CSRF protection, TOTP verification, JWT auth, error message sanitization, and Docker action whitelist.",
    highlights: [
      "Rate limiting on all API endpoints",
      "Docker action whitelist enforcement",
      "Error message sanitization",
      "Security headers — CSP, HSTS, X-Frame-Options",
    ],
  },
  {
    date: "Jan 2026",
    version: "v0.9.0",
    tag: "mcp",
    title: "MCP Plugin Architecture",
    description: "4 MCP plugin servers integrated — HexStrike (150+ tools), PentAGI (workflows), RedTeam (offensive ops), and MCP-UI (visualization). Compatible with Claude Desktop, Cursor, and any MCP client.",
    highlights: [
      "HexStrike AI — 150+ cybersecurity tools via MCP",
      "PentAGI adapter registered as MCP plugin",
      "MCP-UI server for dashboard components",
      "Smart model router with 5 complexity tiers",
    ],
  },
  {
    date: "Dec 2025",
    version: "v0.8.0",
    tag: "improvement",
    title: "CLI Skills Framework",
    description: "6 built-in skills for Claude Code integration — healthcheck, maintain, bugfix, scaffold, feature-deploy, and website-sync. Codebase-aware automation.",
    highlights: [
      "harbinger-healthcheck — full codebase scanning",
      "harbinger-scaffold — generate pages, stores, handlers",
      "harbinger-feature-deploy — plan, build, ship pipeline",
      "harbinger-website-sync — sync website and docs",
    ],
  },
];

const tagConfig: Record<string, { color: string; label: string }> = {
  feature: { color: "#00d4ff", label: "Feature" },
  security: { color: "#ef4444", label: "Security" },
  agent: { color: "#a78bfa", label: "Agent" },
  mcp: { color: "#4ade80", label: "MCP" },
  improvement: { color: "#f59e0b", label: "Improvement" },
};

export default function ChangelogSection() {
  return (
    <SectionWrapper id="changelog">
      <SectionLabel>What's New</SectionLabel>
      <SectionTitle>Shipping fast, shipping transparent.</SectionTitle>
      <SectionDesc>
        Recent releases and milestones. Every update is observable, auditable, and documented.
      </SectionDesc>

      <div className="mt-14 max-w-2xl">
        {entries.map((entry, idx) => {
          const tag = tagConfig[entry.tag];
          return (
            <div key={entry.version} className="relative pl-8 pb-10 last:pb-0">
              {/* Timeline */}
              {idx < entries.length - 1 && (
                <div className="absolute left-[7px] top-5 bottom-0 w-px bg-white/[0.06]" />
              )}
              <div
                className="absolute left-0 top-[4px] w-[15px] h-[15px] rounded-full border-2 bg-[#0a0a0f]"
                style={{ borderColor: tag.color }}
              >
                {idx === 0 && (
                  <div className="absolute inset-[2px] rounded-full" style={{ backgroundColor: tag.color }} />
                )}
              </div>

              {/* Content */}
              <div className="group">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-[13px] font-bold" style={{ color: tag.color }}>
                    {entry.version}
                  </span>
                  <span
                    className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border"
                    style={{
                      color: tag.color,
                      borderColor: `${tag.color}30`,
                      backgroundColor: `${tag.color}08`,
                    }}
                  >
                    {tag.label}
                  </span>
                  <span className="font-mono text-[10px] text-[#444]">{entry.date}</span>
                </div>

                <h4 className="font-display font-semibold text-white text-[15px] mb-2 group-hover:text-[#00d4ff] transition-colors">
                  {entry.title}
                </h4>
                <p className="text-[12px] text-[#777] leading-relaxed mb-3">
                  {entry.description}
                </p>

                <div className="space-y-1.5">
                  {entry.highlights.map((h) => (
                    <div key={h} className="flex items-start gap-2 text-[12px] text-[#555]">
                      <span className="mt-0.5 shrink-0 w-1 h-1 rounded-full" style={{ backgroundColor: tag.color, opacity: 0.5 }} />
                      {h}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
