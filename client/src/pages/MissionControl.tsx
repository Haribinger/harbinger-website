import { useState, useEffect, useCallback, memo, useRef } from "react";
import {
  Shield,
  Zap,
  GitBranch,
  Terminal,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  Cpu,
  Database,
  Globe,
  Lock,
  FileCode2,
  Bug,
  Gauge,
  TestTube2,
  BookOpen,
  Bot,
  Layers,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";

// ── Types ──

type AgentStatus = "idle" | "running" | "success" | "failed" | "queued";
type PipelinePhase = "fix" | "enhance" | "security" | "perf" | "test" | "docs" | "ship";

interface AgentInfo {
  id: string;
  name: string;
  category: string;
  icon: React.ReactNode;
  status: AgentStatus;
  lastRun?: string;
  lastResult?: string;
}

interface PipelineStep {
  phase: PipelinePhase;
  label: string;
  agent: string;
  status: AgentStatus;
  progress: number;
  details?: string;
  duration?: string;
  findings?: number;
}

interface HealthMetric {
  label: string;
  value: number;
  max: number;
  color: string;
}

interface RepoStatus {
  name: string;
  branch: string;
  lastCommit: string;
  uncommitted: number;
  behindRemote: number;
  url: string;
}

// ── Seed Data ──

const PIPELINE_STEPS: PipelineStep[] = [
  { phase: "fix", label: "Error Fix", agent: "auto-fix", status: "idle", progress: 0 },
  { phase: "enhance", label: "Enhance", agent: "auto-enhance", status: "idle", progress: 0 },
  { phase: "security", label: "Security Scan", agent: "auto-security-scan", status: "idle", progress: 0 },
  { phase: "perf", label: "Performance", agent: "auto-perf", status: "idle", progress: 0 },
  { phase: "test", label: "Test Suite", agent: "auto-test", status: "idle", progress: 0 },
  { phase: "docs", label: "Documentation", agent: "auto-docs", status: "idle", progress: 0 },
  { phase: "ship", label: "Ship It", agent: "git-wizard", status: "idle", progress: 0 },
];

const AUTOMATION_AGENTS: AgentInfo[] = [
  { id: "auto-fix", name: "Auto-Fix", category: "automation", icon: <Bug className="w-4 h-4" />, status: "idle" },
  { id: "auto-enhance", name: "Auto-Enhance", category: "automation", icon: <Zap className="w-4 h-4" />, status: "idle" },
  { id: "auto-security-scan", name: "Security Scan", category: "automation", icon: <Shield className="w-4 h-4" />, status: "idle" },
  { id: "auto-perf", name: "Performance", category: "automation", icon: <Gauge className="w-4 h-4" />, status: "idle" },
  { id: "auto-test", name: "Test Runner", category: "automation", icon: <TestTube2 className="w-4 h-4" />, status: "idle" },
  { id: "auto-docs", name: "Doc Generator", category: "automation", icon: <BookOpen className="w-4 h-4" />, status: "idle" },
  { id: "git-wizard", name: "Git Wizard", category: "automation", icon: <GitBranch className="w-4 h-4" />, status: "idle" },
];

const SPECIALIST_AGENTS: AgentInfo[] = [
  { id: "frontend-developer", name: "Frontend Dev", category: "frontend", icon: <Globe className="w-4 h-4" />, status: "idle" },
  { id: "react-specialist", name: "React Expert", category: "frontend", icon: <Layers className="w-4 h-4" />, status: "idle" },
  { id: "typescript-pro", name: "TypeScript Pro", category: "frontend", icon: <FileCode2 className="w-4 h-4" />, status: "idle" },
  { id: "ui-designer", name: "UI Designer", category: "frontend", icon: <Layers className="w-4 h-4" />, status: "idle" },
  { id: "golang-pro", name: "Go Expert", category: "backend", icon: <Terminal className="w-4 h-4" />, status: "idle" },
  { id: "backend-developer", name: "Backend Dev", category: "backend", icon: <Database className="w-4 h-4" />, status: "idle" },
  { id: "api-designer", name: "API Designer", category: "backend", icon: <Globe className="w-4 h-4" />, status: "idle" },
  { id: "websocket-engineer", name: "WebSocket Eng", category: "backend", icon: <Activity className="w-4 h-4" />, status: "idle" },
  { id: "docker-expert", name: "Docker Expert", category: "infra", icon: <Cpu className="w-4 h-4" />, status: "idle" },
  { id: "kubernetes-specialist", name: "K8s Specialist", category: "infra", icon: <Layers className="w-4 h-4" />, status: "idle" },
  { id: "security-engineer", name: "Security Eng", category: "security", icon: <Lock className="w-4 h-4" />, status: "idle" },
  { id: "security-auditor", name: "Security Auditor", category: "security", icon: <Shield className="w-4 h-4" />, status: "idle" },
  { id: "penetration-tester", name: "Pen Tester", category: "security", icon: <Bug className="w-4 h-4" />, status: "idle" },
  { id: "code-reviewer", name: "Code Reviewer", category: "quality", icon: <FileCode2 className="w-4 h-4" />, status: "idle" },
  { id: "performance-engineer", name: "Perf Engineer", category: "quality", icon: <Gauge className="w-4 h-4" />, status: "idle" },
  { id: "test-automator", name: "Test Automator", category: "quality", icon: <TestTube2 className="w-4 h-4" />, status: "idle" },
];

const HEALTH_METRICS: HealthMetric[] = [
  { label: "TypeScript", value: 95, max: 100, color: "#3b82f6" },
  { label: "Build", value: 100, max: 100, color: "#22c55e" },
  { label: "Security", value: 82, max: 100, color: "#f59e0b" },
  { label: "Performance", value: 78, max: 100, color: "#8b5cf6" },
  { label: "Test Coverage", value: 42, max: 100, color: "#ef4444" },
  { label: "Documentation", value: 65, max: 100, color: "#06b6d4" },
];

const REPOS: RepoStatus[] = [
  {
    name: "harbinger-website",
    branch: "main",
    lastCommit: "feat: add production agent swarm system",
    uncommitted: 4,
    behindRemote: 0,
    url: "https://github.com/Haribinger/harbinger-website",
  },
  {
    name: "Harbinger",
    branch: "main",
    lastCommit: "chore: sync agents from website",
    uncommitted: 0,
    behindRemote: 0,
    url: "https://github.com/Haribinger/Harbinger",
  },
];

// ── Helpers ──

function StatusDot({ status }: { status: AgentStatus }) {
  const colors: Record<AgentStatus, string> = {
    idle: "bg-[#333]",
    running: "bg-[#00d4ff] animate-pulse",
    success: "bg-[#22c55e]",
    failed: "bg-[#ef4444]",
    queued: "bg-[#f59e0b]",
  };
  return <span className={`inline-block w-2 h-2 rounded-full ${colors[status]}`} />;
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[11px] font-mono text-[#666] w-8 text-right">{pct}%</span>
    </div>
  );
}

function GlowCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative bg-[#0d0d14] border border-white/[0.04] rounded-lg overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
      <div className="relative">{children}</div>
    </div>
  );
}

// ── Components ──

const Header = memo(function Header() {
  const [time, setTime] = useState(new Date());
  const rafRef = useRef<number>(0);
  const lastSecRef = useRef<number>(-1);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      if (now.getSeconds() !== lastSecRef.current) {
        lastSecRef.current = now.getSeconds();
        setTime(now);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00d4ff]/20 to-[#8b5cf6]/20 flex items-center justify-center border border-white/[0.06]">
            <Bot className="w-5 h-5 text-[#00d4ff]" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#22c55e] rounded-full border-2 border-[#0a0a0f]" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight">Mission Control</h1>
          <p className="text-[11px] text-[#555] font-mono">
            HARBINGER ORCHESTRATOR v1.0 &mdash; {AUTOMATION_AGENTS.length + SPECIALIST_AGENTS.length} AGENTS ONLINE
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[11px] font-mono text-[#444]">
          {time.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          {" "}
          {time.toLocaleTimeString("en-US", { hour12: false })}
        </span>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#22c55e]/10 border border-[#22c55e]/20 rounded text-[11px] text-[#22c55e] font-mono">
          <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full animate-pulse" />
          SYSTEMS ONLINE
        </div>
      </div>
    </div>
  );
});

function PipelinePanel({
  steps,
  onRun,
  running,
}: {
  steps: PipelineStep[];
  onRun: () => void;
  running: boolean;
}) {
  return (
    <GlowCard>
      <div className="p-4 border-b border-white/[0.04] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#00d4ff]" />
          <span className="text-[13px] font-medium text-white">Pipeline</span>
        </div>
        <div className="flex items-center gap-2">
          {running ? (
            <button className="flex items-center gap-1.5 px-3 py-1 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded text-[11px] text-[#ef4444] font-mono hover:bg-[#ef4444]/20 transition-colors">
              <Pause className="w-3 h-3" />
              ABORT
            </button>
          ) : (
            <button
              onClick={onRun}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded text-[11px] text-[#00d4ff] font-mono hover:bg-[#00d4ff]/20 transition-colors"
            >
              <Play className="w-3 h-3" />
              RUN FULL
            </button>
          )}
        </div>
      </div>
      <div className="p-3 space-y-1">
        {steps.map((step, i) => (
          <div
            key={step.phase}
            className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${
              step.status === "running"
                ? "bg-[#00d4ff]/[0.04] border border-[#00d4ff]/10"
                : "hover:bg-white/[0.02]"
            }`}
          >
            <span className="text-[11px] font-mono text-[#333] w-4">{i + 1}</span>
            {step.status === "success" ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e]" />
            ) : step.status === "failed" ? (
              <XCircle className="w-3.5 h-3.5 text-[#ef4444]" />
            ) : step.status === "running" ? (
              <RefreshCw className="w-3.5 h-3.5 text-[#00d4ff] animate-spin" />
            ) : step.status === "queued" ? (
              <Clock className="w-3.5 h-3.5 text-[#f59e0b]" />
            ) : (
              <span className="w-3.5 h-3.5 rounded-full border border-[#333]" />
            )}
            <span className="text-[12px] text-[#aaa] flex-1">{step.label}</span>
            {step.status === "running" && (
              <div className="w-20">
                <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00d4ff] rounded-full transition-all duration-300"
                    style={{ width: `${step.progress}%` }}
                  />
                </div>
              </div>
            )}
            {step.status === "success" && step.findings !== undefined && (
              <span className="text-[10px] font-mono text-[#22c55e]">{step.findings} fixed</span>
            )}
            {step.duration && (
              <span className="text-[10px] font-mono text-[#444]">{step.duration}</span>
            )}
          </div>
        ))}
      </div>
    </GlowCard>
  );
}

function HealthPanel({ metrics }: { metrics: HealthMetric[] }) {
  const avg = Math.round(metrics.reduce((s, m) => s + m.value, 0) / metrics.length);
  return (
    <GlowCard>
      <div className="p-4 border-b border-white/[0.04] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-[#8b5cf6]" />
          <span className="text-[13px] font-medium text-white">Health Score</span>
        </div>
        <span
          className={`text-[13px] font-mono font-bold ${
            avg >= 80 ? "text-[#22c55e]" : avg >= 60 ? "text-[#f59e0b]" : "text-[#ef4444]"
          }`}
        >
          {avg}/100
        </span>
      </div>
      <div className="p-4 space-y-3">
        {metrics.map((m) => (
          <div key={m.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-[#888]">{m.label}</span>
              <span className="text-[11px] font-mono text-[#555]">{m.value}</span>
            </div>
            <ProgressBar value={m.value} max={m.max} color={m.color} />
          </div>
        ))}
      </div>
    </GlowCard>
  );
}

function RepoPanel({ repos }: { repos: RepoStatus[] }) {
  return (
    <GlowCard>
      <div className="p-4 border-b border-white/[0.04] flex items-center gap-2">
        <GitBranch className="w-4 h-4 text-[#f59e0b]" />
        <span className="text-[13px] font-medium text-white">Repositories</span>
      </div>
      <div className="divide-y divide-white/[0.03]">
        {repos.map((r) => (
          <div key={r.name} className="p-4 hover:bg-white/[0.01] transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-white font-medium">{r.name}</span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono bg-white/[0.04] text-[#888] rounded">
                  {r.branch}
                </span>
              </div>
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#555] hover:text-[#00d4ff] transition-colors"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-[11px] text-[#555] font-mono truncate mb-2">{r.lastCommit}</p>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              {r.uncommitted > 0 ? (
                <span className="text-[#f59e0b]">{r.uncommitted} uncommitted</span>
              ) : (
                <span className="text-[#22c55e]">clean</span>
              )}
              {r.behindRemote > 0 && (
                <span className="text-[#ef4444]">{r.behindRemote} behind</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </GlowCard>
  );
}

function AgentGrid({ agents, title, accent }: { agents: AgentInfo[]; title: string; accent: string }) {
  return (
    <GlowCard>
      <div className="p-4 border-b border-white/[0.04] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4" style={{ color: accent }} />
          <span className="text-[13px] font-medium text-white">{title}</span>
        </div>
        <span className="text-[11px] font-mono text-[#444]">{agents.length} agents</span>
      </div>
      <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
        {agents.map((a) => (
          <div
            key={a.id}
            className="group flex items-center gap-2 px-2.5 py-2 rounded hover:bg-white/[0.03] transition-colors cursor-default"
          >
            <StatusDot status={a.status} />
            <span className="text-[11px] text-[#888] group-hover:text-white transition-colors truncate">
              {a.name}
            </span>
          </div>
        ))}
      </div>
    </GlowCard>
  );
}

function LogPanel({ logs }: { logs: string[] }) {
  return (
    <GlowCard className="min-h-0">
      <div className="p-4 border-b border-white/[0.04] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#22c55e]" />
          <span className="text-[13px] font-medium text-white">Activity Log</span>
        </div>
        <button className="text-[11px] text-[#444] hover:text-[#888] transition-colors font-mono">
          CLEAR
        </button>
      </div>
      <div className="p-3 h-48 overflow-y-auto font-mono text-[11px] space-y-0.5 scrollbar-thin">
        {logs.map((log, i) => (
          <div key={i} className="flex items-start gap-2 py-0.5">
            <span className="text-[#333] shrink-0">{String(i + 1).padStart(3, "0")}</span>
            <span className="text-[#888]">{log}</span>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-[#333] flex items-center gap-2 py-4 justify-center">
            <Terminal className="w-3.5 h-3.5" />
            <span>Waiting for pipeline execution...</span>
          </div>
        )}
      </div>
    </GlowCard>
  );
}

function QuickActions({ onAction }: { onAction: (action: string) => void }) {
  const actions = [
    { id: "fix", label: "Quick Fix", icon: <Bug className="w-3.5 h-3.5" />, color: "#ef4444" },
    { id: "security", label: "Security Sweep", icon: <Shield className="w-3.5 h-3.5" />, color: "#f59e0b" },
    { id: "ship", label: "Ship It", icon: <GitBranch className="w-3.5 h-3.5" />, color: "#22c55e" },
    { id: "analyze", label: "Analyze", icon: <Activity className="w-3.5 h-3.5" />, color: "#8b5cf6" },
  ];

  return (
    <div className="flex items-center gap-2">
      {actions.map((a) => (
        <button
          key={a.id}
          onClick={() => onAction(a.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded border transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            borderColor: `${a.color}20`,
            backgroundColor: `${a.color}08`,
            color: a.color,
          }}
        >
          {a.icon}
          <span className="text-[11px] font-mono">{a.label}</span>
        </button>
      ))}
    </div>
  );
}

function StatsRow() {
  const stats = [
    { label: "Agents", value: "39", sub: "online" },
    { label: "Errors", value: "0", sub: "detected" },
    { label: "Files", value: "87", sub: "tracked" },
    { label: "Uptime", value: "99.9%", sub: "this month" },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {stats.map((s) => (
        <GlowCard key={s.label}>
          <div className="p-3 text-center">
            <div className="text-xl font-semibold text-white font-mono">{s.value}</div>
            <div className="text-[10px] text-[#555] font-mono uppercase tracking-wider mt-0.5">
              {s.label} <span className="text-[#333]">{s.sub}</span>
            </div>
          </div>
        </GlowCard>
      ))}
    </div>
  );
}

// ── Main ──

export default function MissionControl() {
  const [pipelineSteps, setPipelineSteps] = useState(PIPELINE_STEPS);
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  // Track all active timers so they can be cleared on unmount
  const timerRefs = useRef<Set<number>>(new Set());

  const safeSetTimeout = useCallback((fn: () => void, delay: number) => {
    const id = window.setTimeout(() => {
      timerRefs.current.delete(id);
      fn();
    }, delay);
    timerRefs.current.add(id);
    return id;
  }, []);

  const safeSetInterval = useCallback((fn: () => void, delay: number) => {
    const id = window.setInterval(fn, delay);
    timerRefs.current.add(id);
    return id;
  }, []);

  // Clear all timers on unmount
  useEffect(() => {
    return () => {
      timerRefs.current.forEach((id) => {
        window.clearTimeout(id);
        window.clearInterval(id);
      });
      timerRefs.current.clear();
    };
  }, []);

  const addLog = useCallback((msg: string) => {
    const ts = new Date().toLocaleTimeString("en-US", { hour12: false });
    setLogs((prev) => [...prev, `[${ts}] ${msg}`]);
  }, []);

  const simulatePipeline = useCallback(() => {
    if (pipelineRunning) return;
    setPipelineRunning(true);
    setLogs([]);
    addLog("Pipeline started — Full execution mode");
    addLog("Assessing harbinger-website...");
    addLog("Assessing Harbinger...");

    let stepIndex = 0;
    const runStep = () => {
      if (stepIndex >= PIPELINE_STEPS.length) {
        setPipelineRunning(false);
        addLog("Pipeline complete — all phases passed");
        return;
      }

      const step = PIPELINE_STEPS[stepIndex];
      addLog(`Phase ${stepIndex + 1}: ${step.label} — starting ${step.agent}...`);

      // Mark as running
      setPipelineSteps((prev) =>
        prev.map((s, i) => (i === stepIndex ? { ...s, status: "running" as AgentStatus, progress: 0 } : s))
      );

      // Simulate progress
      let progress = 0;
      const progressInterval = safeSetInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress >= 100) {
          progress = 100;
          window.clearInterval(progressInterval);
          timerRefs.current.delete(progressInterval);

          const findings = Math.floor(Math.random() * 12);
          const duration = `${(Math.random() * 8 + 2).toFixed(1)}s`;

          setPipelineSteps((prev) =>
            prev.map((s, i) =>
              i === stepIndex
                ? { ...s, status: "success" as AgentStatus, progress: 100, findings, duration }
                : s
            )
          );
          addLog(`Phase ${stepIndex + 1}: ${step.label} — complete (${findings} items, ${duration})`);
          stepIndex++;
          safeSetTimeout(runStep, 400);
        } else {
          setPipelineSteps((prev) =>
            prev.map((s, i) => (i === stepIndex ? { ...s, progress: Math.round(progress) } : s))
          );
        }
      }, 300);
    };

    safeSetTimeout(runStep, 800);
  }, [pipelineRunning, addLog, safeSetInterval, safeSetTimeout]);

  const handleQuickAction = useCallback(
    (action: string) => {
      addLog(`Quick action: ${action}`);
    },
    [addLog]
  );

  // Keyboard shortcut
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "r" && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        simulatePipeline();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [simulatePipeline]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Header />

        {/* Quick Actions + Stats */}
        <div className="flex items-center justify-between mb-4">
          <QuickActions onAction={handleQuickAction} />
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-[#333]">
            <kbd className="px-1.5 py-0.5 border border-[#222] rounded text-[10px]">Ctrl</kbd>
            <kbd className="px-1.5 py-0.5 border border-[#222] rounded text-[10px]">Shift</kbd>
            <kbd className="px-1.5 py-0.5 border border-[#222] rounded text-[10px]">R</kbd>
            <span className="ml-1">Run pipeline</span>
          </div>
        </div>

        <div className="mb-4">
          <StatsRow />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Left: Pipeline + Log */}
          <div className="lg:col-span-2 space-y-4 min-h-0">
            <PipelinePanel steps={pipelineSteps} onRun={simulatePipeline} running={pipelineRunning} />
            <LogPanel logs={logs} />
          </div>

          {/* Right: Health + Repos */}
          <div className="space-y-4 min-h-0">
            <HealthPanel metrics={HEALTH_METRICS} />
            <RepoPanel repos={REPOS} />
          </div>
        </div>

        {/* Agent Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <AgentGrid agents={AUTOMATION_AGENTS} title="Automation Agents" accent="#00d4ff" />
          <AgentGrid agents={SPECIALIST_AGENTS} title="Specialist Agents" accent="#8b5cf6" />
        </div>

        {/* Footer */}
        <div className="text-center py-4 border-t border-white/[0.03]">
          <p className="text-[10px] font-mono text-[#333]">
            HARBINGER MISSION CONTROL &mdash; PRIVATE &mdash; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
