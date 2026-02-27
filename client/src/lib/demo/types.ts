export type AgentId =
  | "pathfinder"
  | "breach"
  | "phantom"
  | "specter"
  | "forge"
  | "sage"
  | "scribe"
  | "sentinel"
  | "oracle"
  | "flux"
  | "genesis";

export interface Agent {
  id: AgentId;
  name: string;
  role: string;
  color: string;
  icon: string; // emoji shorthand
  tools: string[];
}

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export interface Finding {
  title: string;
  severity: Severity;
  target: string;
  description: string;
  evidence?: string;
}

// Scenario event types
export interface AgentThinkingEvent {
  type: "agent_thinking";
  agent: AgentId;
  duration: number; // ms
}

export interface AgentMessageEvent {
  type: "agent_message";
  agent: AgentId;
  text: string;
  charDelay?: number; // ms per char, default 20
}

export interface ToolCallEvent {
  type: "tool_call";
  agent: AgentId;
  tool: string;
  command: string;
  duration: number; // ms for progress bar
}

export interface ToolResultEvent {
  type: "tool_result";
  agent: AgentId;
  result: string;
  status: "success" | "warning" | "error";
}

export interface FindingEvent {
  type: "finding";
  agent: AgentId;
  finding: Finding;
}

export interface HandoffEvent {
  type: "handoff";
  from: AgentId;
  to: AgentId;
  reason: string;
}

export interface CostSummaryEvent {
  type: "cost_summary";
  tokens: number;
  tools: number;
  findings: number;
  duration: string;
}

export type ScenarioEvent =
  | AgentThinkingEvent
  | AgentMessageEvent
  | ToolCallEvent
  | ToolResultEvent
  | FindingEvent
  | HandoffEvent
  | CostSummaryEvent;

export interface Scenario {
  id: string;
  title: string;
  description: string;
  cost: number; // credits
  icon: string;
  events: ScenarioEvent[];
}

// Chat message types rendered in the UI
export type ChatMessageType =
  | "user"
  | "agent_message"
  | "thinking"
  | "tool_call"
  | "tool_result"
  | "finding"
  | "handoff"
  | "cost_summary";

export interface ChatMsg {
  id: string;
  type: ChatMessageType;
  agent?: AgentId;
  text?: string;
  isStreaming?: boolean;
  // tool_call specific
  tool?: string;
  command?: string;
  toolProgress?: number; // 0-100
  toolDuration?: number;
  // tool_result specific
  toolStatus?: "success" | "warning" | "error";
  // finding specific
  finding?: Finding;
  // handoff specific
  fromAgent?: AgentId;
  toAgent?: AgentId;
  handoffReason?: string;
  // cost_summary specific
  tokens?: number;
  toolsUsed?: number;
  findingsCount?: number;
  duration?: string;
}
