import type { Agent, AgentId } from "./types";

export const agents: Record<AgentId, Agent> = {
  pathfinder: {
    id: "pathfinder",
    name: "PATHFINDER",
    role: "Recon & Discovery",
    color: "#00d4ff",
    icon: "🔍",
    tools: ["subfinder", "httpx", "whatweb", "dirsearch", "amass"],
  },
  breach: {
    id: "breach",
    name: "BREACH",
    role: "Exploit & Validate",
    color: "#ef4444",
    icon: "💥",
    tools: ["nuclei", "sqlmap", "xsstrike", "commix"],
  },
  phantom: {
    id: "phantom",
    name: "PHANTOM",
    role: "Cloud Security",
    color: "#a78bfa",
    icon: "👻",
    tools: ["prowler", "scout-suite", "cloudsplaining", "pacu"],
  },
  specter: {
    id: "specter",
    name: "SPECTER",
    role: "OSINT & Intel",
    color: "#f59e0b",
    icon: "👁",
    tools: ["theHarvester", "sherlock", "spiderfoot", "maltego"],
  },
  forge: {
    id: "forge",
    name: "FORGE",
    role: "Payload Craft",
    color: "#f97316",
    icon: "🔨",
    tools: ["msfvenom", "ysoserial", "jwt-tool"],
  },
  sage: {
    id: "sage",
    name: "SAGE",
    role: "Risk Analysis",
    color: "#4ade80",
    icon: "🧠",
    tools: ["cvss-calculator", "attack-flow", "mitre-mapper"],
  },
  scribe: {
    id: "scribe",
    name: "SCRIBE",
    role: "Report Writer",
    color: "#60a5fa",
    icon: "📝",
    tools: ["markdown-gen", "pdf-export", "jira-sync"],
  },
  sentinel: {
    id: "sentinel",
    name: "SENTINEL",
    role: "Continuous Monitor",
    color: "#22d3ee",
    icon: "🛡",
    tools: ["nuclei-monitor", "diff-scanner", "alert-engine"],
  },
  oracle: {
    id: "oracle",
    name: "ORACLE",
    role: "Threat Intelligence",
    color: "#e879f9",
    icon: "🔮",
    tools: ["shodan", "censys", "greynoise", "virustotal"],
  },
  flux: {
    id: "flux",
    name: "FLUX",
    role: "Workflow Orchestrator",
    color: "#fbbf24",
    icon: "⚡",
    tools: ["task-scheduler", "agent-router", "priority-queue"],
  },
  genesis: {
    id: "genesis",
    name: "GENESIS",
    role: "Environment Setup",
    color: "#34d399",
    icon: "🌱",
    tools: ["docker-compose", "network-setup", "scope-manager"],
  },
};

export const agentList = Object.values(agents);

export function getAgent(id: AgentId): Agent {
  return agents[id];
}
