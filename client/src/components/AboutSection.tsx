import SectionWrapper, { SectionDesc, SectionLabel, SectionTitle } from "./SectionWrapper";
import { Check, X } from "lucide-react";

const pillars = [
  { title: "Agent Runtime OS", desc: "Standardized runtime for security agents with lifecycle management, event dispatch, and policy enforcement." },
  { title: "Tool Orchestration Engine", desc: "150+ security tools exposed via MCP protocol — nmap, sqlmap, nuclei, subfinder, and more." },
  { title: "Workflow Graph Execution", desc: "Directed graph engine with parallel branches, conditions, approvals, handoffs, and retry logic." },
  { title: "Observability-First", desc: "Every agent action is logged, graphed, costed, and replayable. Real timelines, not chat bubbles." },
];

const isItems = [
  "An Agent Runtime OS",
  "A Tool Orchestration Engine",
  "A Workflow Graph Execution Layer",
  "Observability-first",
  "Contributor-friendly",
  "Local-first, configurable for cloud",
];

const isNotItems = [
  "An AI chatbot UI",
  "A SaaS bug bounty marketplace",
  "A \"prompt → tool run\" wrapper",
  "A magic black box",
];

export default function AboutSection() {
  return (
    <SectionWrapper id="about">
      <SectionLabel>What is Harbinger</SectionLabel>
      <SectionTitle>An Agent Runtime OS for offensive security.</SectionTitle>
      <SectionDesc>
        Security professionals need orchestrated workflows, full visibility, and local-first operation — not another chatbot wrapper. Harbinger is the framework that delivers all three.
      </SectionDesc>

      {/* Pillars */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px mt-16 bg-white/[0.04] rounded-lg overflow-hidden">
        {pillars.map((p, i) => (
          <div key={i} className="bg-[#0a0a0f] p-6 hover:bg-white/[0.02] transition-colors">
            <div className="text-[13px] font-mono text-[#00d4ff] mb-3">0{i + 1}</div>
            <h3 className="font-display font-semibold text-white text-[15px] leading-snug">{p.title}</h3>
            <p className="mt-2 text-[13px] text-[#666] leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>

      {/* IS / IS NOT */}
      <div className="grid md:grid-cols-2 gap-px mt-8 bg-white/[0.04] rounded-lg overflow-hidden">
        <div className="bg-[#0a0a0f] p-6">
          <h3 className="font-display font-semibold text-[15px] text-[#4ade80] mb-5 flex items-center gap-2">
            <Check className="w-4 h-4" /> Harbinger IS
          </h3>
          <div className="space-y-3">
            {isItems.map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-[13px] text-[#999]">
                <Check className="w-3.5 h-3.5 text-[#4ade80] shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#0a0a0f] p-6">
          <h3 className="font-display font-semibold text-[15px] text-[#ef4444] mb-5 flex items-center gap-2">
            <X className="w-4 h-4" /> Harbinger is NOT
          </h3>
          <div className="space-y-3">
            {isNotItems.map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-[13px] text-[#999]">
                <X className="w-3.5 h-3.5 text-[#ef4444] shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
