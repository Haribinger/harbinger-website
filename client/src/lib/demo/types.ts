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
  icon: string;
  tools: string[];
}

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export interface Finding {
  title: string;
  severity: Severity;
  target: string;
  description: string;
  evidence?: string;
  cvss?: number;
}

// ── Docker container state ──
export interface DockerContainer {
  id: string;
  name: string;
  image: string;
  agent: AgentId;
  status: "creating" | "running" | "stopped";
  cpu: number;   // 0-100
  memory: number; // MB
}

// ── Tool output line (ANSI-colored terminal output) ──
export interface ToolOutputLine {
  text: string;
  color?: string; // hex color for the line
}

// ── Network connection ──
export interface NetworkConnection {
  id: string;
  from: AgentId;
  to: string; // agent id or external target
  label: string;
  active: boolean;
}

// ── Browser state ──
export interface BrowserState {
  url: string;
  title: string;
  statusCode: number;
  agentOverlay?: string; // e.g. "PATHFINDER is analyzing page..."
  actions: BrowserAction[];
}

export interface BrowserAction {
  type: "click" | "type" | "scroll" | "screenshot";
  target: string;
  timestamp: number;
}

// ── Scenario event types ──

export interface AgentThinkingEvent {
  type: "agent_thinking";
  agent: AgentId;
  duration: number;
}

export interface AgentMessageEvent {
  type: "agent_message";
  agent: AgentId;
  text: string;
  charDelay?: number;
}

export interface ToolCallEvent {
  type: "tool_call";
  agent: AgentId;
  tool: string;
  command: string;
  duration: number;
  outputLines?: ToolOutputLine[]; // streaming terminal output
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
  containers: number;
}

// ── New event types ──

export interface DockerSpawnEvent {
  type: "docker_spawn";
  agent: AgentId;
  containerId: string;
  containerName: string;
  image: string;
}

export interface DockerLogEvent {
  type: "docker_log";
  containerId: string;
  lines: ToolOutputLine[];
}

export interface DockerStopEvent {
  type: "docker_stop";
  containerId: string;
}

export interface BrowserNavigateEvent {
  type: "browser_navigate";
  agent: AgentId;
  url: string;
  title: string;
  statusCode: number;
}

export interface BrowserActionEvent {
  type: "browser_action";
  agent: AgentId;
  action: BrowserAction;
}

export interface NetworkActivityEvent {
  type: "network_activity";
  connections: Array<{
    from: AgentId;
    to: string;
    label: string;
  }>;
  duration: number;
}

export type ScenarioEvent =
  | AgentThinkingEvent
  | AgentMessageEvent
  | ToolCallEvent
  | ToolResultEvent
  | FindingEvent
  | HandoffEvent
  | CostSummaryEvent
  | DockerSpawnEvent
  | DockerLogEvent
  | DockerStopEvent
  | BrowserNavigateEvent
  | BrowserActionEvent
  | NetworkActivityEvent;

export interface Scenario {
  id: string;
  title: string;
  description: string;
  cost: number;
  icon: string;
  events: ScenarioEvent[];
}

// ── Chat message types ──

export type ChatMessageType =
  | "user"
  | "agent_message"
  | "thinking"
  | "tool_call"
  | "tool_result"
  | "finding"
  | "handoff"
  | "cost_summary"
  | "docker_spawn"
  | "docker_log"
  | "browser_navigate"
  | "browser_action";

export interface ChatMsg {
  id: string;
  type: ChatMessageType;
  agent?: AgentId;
  text?: string;
  isStreaming?: boolean;
  // tool_call
  tool?: string;
  command?: string;
  toolProgress?: number;
  toolDuration?: number;
  toolOutputLines?: ToolOutputLine[];
  toolOutputIndex?: number; // how many output lines revealed so far
  // tool_result
  toolStatus?: "success" | "warning" | "error";
  // finding
  finding?: Finding;
  // handoff
  fromAgent?: AgentId;
  toAgent?: AgentId;
  handoffReason?: string;
  // cost_summary
  tokens?: number;
  toolsUsed?: number;
  findingsCount?: number;
  duration?: string;
  containersUsed?: number;
  // docker_spawn
  containerId?: string;
  containerName?: string;
  containerImage?: string;
  // docker_log
  dockerLogLines?: ToolOutputLine[];
  // browser
  browserUrl?: string;
  browserTitle?: string;
  browserStatusCode?: number;
  browserAction?: BrowserAction;
}
