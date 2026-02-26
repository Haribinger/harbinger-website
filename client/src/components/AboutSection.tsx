import SectionWrapper, { SectionDesc, SectionLabel, SectionTitle } from "./SectionWrapper";
import { Cpu, Wrench, GitBranch, Eye, Users, Lock, Minus, MessageSquare, ShoppingCart, Sparkles, HelpCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const pillars = [
  { title: "Agent Runtime OS", desc: "Standardized runtime for security agents with lifecycle management, event dispatch, and policy enforcement." },
  { title: "Tool Orchestration Engine", desc: "150+ security tools exposed via MCP protocol — nmap, sqlmap, nuclei, subfinder, and more." },
  { title: "Workflow Graph Execution", desc: "Directed graph engine with parallel branches, conditions, approvals, handoffs, and retry logic." },
  { title: "Observability-First", desc: "Every agent action is logged, graphed, costed, and replayable. Real timelines, not chat bubbles." },
];

interface ListItem {
  icon: LucideIcon;
  text: string;
}

const isItems: ListItem[] = [
  { icon: Cpu, text: "Agent Runtime OS" },
  { icon: Wrench, text: "Tool Orchestration Engine" },
  { icon: GitBranch, text: "Workflow Graph Execution" },
  { icon: Eye, text: "Observable by default" },
  { icon: Users, text: "Contributor-friendly" },
  { icon: Lock, text: "Local-first, configurable for cloud" },
];

const isNotItems: ListItem[] = [
  { icon: MessageSquare, text: "An AI chatbot UI" },
  { icon: ShoppingCart, text: "A SaaS bug bounty marketplace" },
  { icon: Sparkles, text: 'A "prompt → tool run" wrapper' },
  { icon: HelpCircle, text: "A magic black box" },
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
            Harbinger IS
          </h3>
          <div className="space-y-3.5">
            {isItems.map((item) => (
              <div key={item.text} className="flex items-center gap-3 text-[13px] text-[#999]">
                <item.icon className="w-4 h-4 text-[#4ade80] shrink-0" />
                {item.text}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#0a0a0f] p-6">
          <h3 className="font-display font-semibold text-[15px] text-[#ef4444] mb-5 flex items-center gap-2">
            Harbinger is NOT
          </h3>
          <div className="space-y-3.5">
            {isNotItems.map((item) => (
              <div key={item.text} className="flex items-center gap-3 text-[13px] text-[#999]">
                <item.icon className="w-4 h-4 text-[#ef4444]/60 shrink-0" />
                <span className="line-through decoration-[#ef4444]/30">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
