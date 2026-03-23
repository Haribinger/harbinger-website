import SectionWrapper, { SectionDesc, SectionLabel, SectionTitle } from "./SectionWrapper";
import { Box, Brain, Database, Shield, Terminal, Users, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const features: Feature[] = [
  { icon: Brain, title: "Execution Engine", desc: "Mission to Task to SubTask to Action with ReAct loops. Agents reason, act, and observe in real containers. Parallel DAG scheduling executes independent tasks simultaneously." },
  { icon: Users, title: "12 Specialized Agents", desc: "PATHFINDER (recon), BREACH (exploit), SAM (code), SCRIBE (reports), and 8 more. Each with a dedicated Docker image, personality, and autonomous thinking loops." },
  { icon: Terminal, title: "68 Security Tools", desc: "ProjectDiscovery suite, Kali tools, OSINT, dev tools across 5 purpose-built Docker images. Every tool callable via MCP or direct execution." },
  { icon: Database, title: "Knowledge Graph", desc: "Neo4j entities (hosts, services, vulns) plus pgvector semantic memory. Agents learn across missions and share context through a persistent knowledge layer." },
  { icon: Wrench, title: "Plugin Registry", desc: "Nothing hardcoded. Configure agents, tools, templates, and settings via API. User-addable everything — bring your own tools, models, and workflows." },
  { icon: Shield, title: "Self-Healing", desc: "Detects container failures, LLM-powered diagnosis, auto-restarts. Kill switch for emergencies. Scope enforcement and safety controls built into every operation." },
];

export default function FeaturesSection() {
  return (
    <SectionWrapper id="features">
      <SectionLabel>Capabilities</SectionLabel>
      <SectionTitle>Everything you need. Nothing you don't.</SectionTitle>
      <SectionDesc>
        A mission-driven execution engine built for professionals who need autonomous agents, full visibility, and local-first operation.
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
