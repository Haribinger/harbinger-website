import SectionWrapper, { SectionDesc, SectionLabel, SectionTitle } from "./SectionWrapper";
import { Activity, Box, Eye, GitBranch, Globe, Lock, Network, Shield, Terminal, Users, Workflow, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const features: Feature[] = [
  { icon: Users, title: "Multi-Agent Swarm", desc: "Specialized agents — recon, web, binary, cloud, OSINT — collaborate through formal handoff protocols and shared context." },
  { icon: Workflow, title: "Workflow Graph Engine", desc: "Directed graph execution with parallel branches, conditions, approvals, handoffs, and retry logic." },
  { icon: Terminal, title: "150+ Security Tools", desc: "Nmap, SQLMap, Nuclei, Subfinder, httpx, Prowler, and 140+ more — all via MCP protocol." },
  { icon: Network, title: "MCP-First Architecture", desc: "Every tool exposed via Model Context Protocol. Compatible with Claude Desktop, Cursor, and any MCP client." },
  { icon: Eye, title: "Observable by Design", desc: "Real-time event streams, timeline views, graph views, artifact downloads, cost tracking. No black boxes." },
  { icon: Lock, title: "100% Local-First", desc: "Runs entirely on Docker with Ollama or LM Studio. Zero mandatory cloud APIs. Your data stays yours." },
  { icon: GitBranch, title: "Git Memory", desc: "Every significant event committed to a Git repo. Full auditability, replay, and GitHub Actions compute." },
  { icon: Shield, title: "Cost Governance", desc: "Max token budgets, runtime limits, tool invocation caps, Docker resource controls, concurrency limits." },
  { icon: Box, title: "Docker Isolation", desc: "Each tool runs in a fresh container with resource limits and network isolation. No tool can escape its sandbox." },
  { icon: Zap, title: "Plugin SDK", desc: "Extend with custom tools, agents, channels, workflows, and report templates. Drop-in plugin architecture." },
  { icon: Globe, title: "Multi-Channel", desc: "Control from Web UI, Telegram, Discord, GitHub webhooks, CLI, or any MCP client. One orchestrator, many surfaces." },
  { icon: Activity, title: "Persistent Learning", desc: "Episodic memory, semantic embeddings, strategic playbooks. Agents improve with every engagement." },
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
