import SectionWrapper, { SectionDesc, SectionLabel, SectionTitle } from "./SectionWrapper";
import { Activity, Box, Brain, Eye, GitBranch, Globe, Lock, Network, Radio, Shield, Target, Terminal, Users, Workflow, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const features: Feature[] = [
  { icon: Users, title: "11-Agent Swarm", desc: "PATHFINDER, BREACH, PHANTOM, SPECTER, CIPHER, SCRIBE, SAM, BRIEF, SAGE, LENS, MAINTAINER — each with personality, tools, and autonomous thinking loops." },
  { icon: Brain, title: "Autonomous Intelligence", desc: "Every agent runs a 60-second thinking loop. Scans 5 dimensions, calculates efficiency ratios, proposes automations. Approve, reject, or implement from the dashboard." },
  { icon: Workflow, title: "Workflow Graph Engine", desc: "Visual directed graph editor with 6 node types, parallel branches, conditions, approvals, handoffs. Built on @xyflow/react." },
  { icon: Terminal, title: "150+ Security Tools", desc: "Nuclei, SQLMap, Subfinder, httpx, Prowler, Nikto, dirsearch, and 140+ more — all via 4 MCP plugin servers." },
  { icon: Network, title: "MCP-First Architecture", desc: "HexStrike, PentAGI, RedTeam, and MCP-UI servers. Compatible with Claude Desktop, Cursor, and any MCP client." },
  { icon: Eye, title: "Observable by Design", desc: "19 dashboard pages, real-time event streams, agent timeline views, graph views, cost tracking, autonomous thought log. No black boxes." },
  { icon: Lock, title: "100% Local-First", desc: "9 Docker services, pgvector, Redis, Neo4j. Runs entirely local with Ollama or LM Studio. Your data stays yours." },
  { icon: Shield, title: "Production Security", desc: "OAuth CSRF protection, TOTP verification, JWT auth, error sanitization, Docker action whitelist, rate limiting, request body limits." },
  { icon: Box, title: "Docker Isolation", desc: "Each agent runs in a fresh container with CPU/memory limits and network isolation. Configurable per-agent resource profiles." },
  { icon: Zap, title: "Smart Model Router", desc: "5 complexity tiers, local-first with cloud fallback, per-agent overrides. CIPHER uses Opus, PATHFINDER uses Sonnet, MAINTAINER stays local." },
  { icon: Globe, title: "Multi-Channel", desc: "Control from Web UI, Telegram, Discord, GitHub webhooks, CLI, or any MCP client. One orchestrator, many surfaces." },
  { icon: Activity, title: "Meta-Cognition", desc: "Agents monitor their own performance, identify improvements, calculate cost-benefit ratios, and coordinate through swarm awareness." },
  { icon: GitBranch, title: "Red Team C2", desc: "Mythic, Sliver, Havoc, Cobalt Strike, or custom C2. Listener management, payload generation, implant tracking, and attack chain orchestration." },
  { icon: Radio, title: "Realtime Streaming", desc: "SSE event bus with 1,000-event ring buffer. Multi-operator sessions, agent heartbeats, command output streaming, and global kill switch — sub-100ms latency." },
  { icon: Brain, title: "Agent Learning Engine", desc: "Technique scoring, campaign tracking, LOL discovery pipeline, per-agent performance metrics, and AI recommendations with 4 heuristic engines." },
  { icon: Target, title: "Safety Controls", desc: "Target validation with 8 built-in rules, scope enforcement with exclude-always-wins, per-operation rate limiting, audit trails, and approval workflows." },
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
