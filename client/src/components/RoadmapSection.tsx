import SectionWrapper, { SectionDesc, SectionLabel, SectionTitle } from "./SectionWrapper";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Phase {
  id: string;
  title: string;
  weeks: string;
  tagline: string;
  status: "active" | "upcoming" | "future";
  items: string[];
}

const phases: Phase[] = [
  {
    id: "0.9", title: "Agent Runtime MVP", weeks: "Weeks 1–3", tagline: "Make agent-to-agent workflows observable and composable.",
    status: "active",
    items: ["Agent Runtime Interface (start_session, dispatch_task, stream_events)", "Workflow Graph Model (agent/tool/condition/approval/handoff nodes)", "Observability Event Schema (THOUGHT, PLAN, TOOL_CALL, FINDING, HANDOFF, COST)", "Minimal PentAGI Adapter (registers as runtime plugin)", "UI: Timeline view + graph view + expandable tool calls + cost panel"],
  },
  {
    id: "1.0", title: "Production Blockers", weeks: "Weeks 3–4", tagline: "Fix everything that prevents production deployment.",
    status: "upcoming",
    items: ["Backend env vars in docker-compose", "Frontend VITE_API_URL defaults for production", "Production secret validation", "Canonical /api/v1 base path", "Single backend entrypoint for Docker + dev"],
  },
  {
    id: "1.5", title: "CLI Onboarding", weeks: "Weeks 4–5", tagline: "Single entry point CLI: onboard, configure, doctor.",
    status: "upcoming",
    items: ["harbinger onboard (--quick, --advanced, --non-interactive)", "harbinger configure (platform, channels, agent)", "harbinger doctor (--prod mode)", "Channel selection wizard + config/channels.json"],
  },
  {
    id: "2.0", title: "Production Hardening", weeks: "Weeks 5–7", tagline: "SSL, monitoring, cost controls, security.",
    status: "upcoming",
    items: ["HTTPS via Let's Encrypt or custom certs", "Cost governance layer (token budget, runtime, concurrency limits)", "Rate limiting on API endpoints", "Health checks for all services", "Resource usage panel in UI"],
  },
  {
    id: "3.0", title: "Hybrid Architecture", weeks: "Weeks 7–10", tagline: "Registry-based channels, plugin SDK, clean dispatch.",
    status: "future",
    items: ["Channel registry (Telegram, Discord, Web, GitHub, CLI as plugins)", "Orchestrator refactored to dispatch(event) pattern", "Plugin Development Kit (tool, agent, channel, workflow, report)", "Plugin loader from /plugins/ directory"],
  },
  {
    id: "4.0", title: "Persistent Learning", weeks: "Weeks 10–14", tagline: "Agents that learn and improve over time.",
    status: "future",
    items: ["Short-term memory (session context)", "Episodic memory (job summaries)", "Semantic memory (embedding index)", "Strategic memory (playbooks from successful engagements)", "Git Memory module (commit every event)"],
  },
  {
    id: "5.0", title: "Knowledge Graph", weeks: "Weeks 14–18", tagline: "Collective intelligence and community contributions.",
    status: "future",
    items: ["Neo4j Knowledge Graph integration", "HowToHunt methodology ingestion", "Community contribution portal", "Agent Capability Matrix"],
  },
  {
    id: "6.0", title: "Advanced Features", weeks: "Weeks 18–24", tagline: "Competitive agents, consensus mode, public website.",
    status: "future",
    items: ["Competitive agents mode (best result wins)", "Consensus verification mode", "Advanced MCP-UI components", "Plugin marketplace website"],
  },
];

function PhaseCard({ phase }: { phase: Phase }) {
  const [open, setOpen] = useState(phase.status === "active");
  const statusColor = phase.status === "active" ? "#00d4ff" : phase.status === "upcoming" ? "#f59e0b" : "#333";

  return (
    <div className="relative pl-8 pb-8 last:pb-0">
      {/* Timeline line */}
      <div className="absolute left-[7px] top-3 bottom-0 w-px bg-white/[0.06]" />
      {/* Timeline dot */}
      <div
        className="absolute left-0 top-[6px] w-[15px] h-[15px] rounded-full border-2 bg-[#0a0a0f]"
        style={{ borderColor: statusColor }}
      >
        {phase.status === "active" && (
          <div className="absolute inset-[2px] rounded-full" style={{ backgroundColor: statusColor }} />
        )}
      </div>

      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left group"
      >
        <div className="flex items-baseline gap-3 mb-1">
          <span className="font-mono text-[11px]" style={{ color: statusColor }}>Phase {phase.id}</span>
          <span className="font-display font-semibold text-white text-[15px] group-hover:text-[#00d4ff] transition-colors">{phase.title}</span>
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
