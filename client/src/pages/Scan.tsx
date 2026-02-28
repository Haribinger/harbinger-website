import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Search,
  Zap,
  Cloud,
  Eye,
  Play,
  Square,
  Terminal,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  CreditCard,
} from "lucide-react";
import { Link } from "wouter";
import { createScan, cancelScan, isAuthenticated, type ScanRequest } from "@/lib/api";
import { getWS, type ScanEvent } from "@/lib/websocket";

interface LogEntry {
  id: string;
  type: string;
  agentId?: string;
  text: string;
  timestamp: Date;
  color?: string;
}

interface LiveFinding {
  title: string;
  severity: string;
  target: string;
  agent: string;
}

const SCAN_TYPES = [
  { id: "recon", label: "Reconnaissance", icon: Search, cost: 1, desc: "Subdomain discovery, port scanning, tech detection" },
  { id: "vuln_scan", label: "Vulnerability Scan", icon: Shield, cost: 2, desc: "CVE detection, nuclei templates, web vulnerabilities" },
  { id: "full_audit", label: "Full Security Audit", icon: Zap, cost: 3, desc: "Complete assessment with all agents" },
  { id: "cloud_audit", label: "Cloud Audit", icon: Cloud, cost: 3, desc: "AWS/GCP/Azure misconfigurations" },
  { id: "osint", label: "OSINT Recon", icon: Eye, cost: 1, desc: "Email harvesting, social profiling, data leaks" },
] as const;

const AGENT_COLORS: Record<string, string> = {
  pathfinder: "#00d4ff",
  breach: "#ef4444",
  phantom: "#a78bfa",
  specter: "#f59e0b",
  forge: "#f97316",
  sage: "#4ade80",
  oracle: "#e879f9",
  sentinel: "#22d3ee",
  flux: "#fbbf24",
  genesis: "#34d399",
};

export default function Scan() {
  const [target, setTarget] = useState("");
  const [scanType, setScanType] = useState<string>("recon");
  const [scanId, setScanId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "completed" | "failed" | "cancelled">("idle");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [findings, setFindings] = useState<LiveFinding[]>([]);
  const [activeAgents, setActiveAgents] = useState<Set<string>>(new Set());
  const [containers, setContainers] = useState<Map<string, string>>(new Map()); // id -> status
  const [error, setError] = useState<string | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const logIdCounter = useRef(0);

  const addLog = useCallback((type: string, text: string, agentId?: string, color?: string) => {
    const id = `log-${logIdCounter.current++}`;
    setLogs((prev) => [...prev, { id, type, agentId, text, timestamp: new Date(), color }]);
  }, []);

  // WebSocket event handling
  useEffect(() => {
    if (!scanId) return;

    const ws = getWS();
    ws.connect();
    ws.subscribe(scanId);

    const unsub = ws.on("*", (event: ScanEvent) => {
      if (event.scan_id !== scanId) return;

      const data = event.data as Record<string, string>;
      const agentId = event.agent_id;
      const agentColor = agentId ? AGENT_COLORS[agentId] : undefined;

      switch (event.type) {
        case "scan_start":
          addLog("system", `Scan started: ${data.target} (${data.scan_type})`, undefined, "#00d4ff");
          break;

        case "agent_thinking":
          if (agentId) {
            setActiveAgents((prev) => new Set(prev).add(agentId));
          }
          addLog("thinking", data.message || `${agentId} analyzing...`, agentId, agentColor);
          break;

        case "tool_call":
          addLog("tool", `$ ${data.command}`, agentId, agentColor);
          break;

        case "docker_spawn":
          setContainers((prev) => new Map(prev).set(data.container_id, "running"));
          addLog("docker", `Container ${data.container_name} spawned (${data.image})`, agentId, "#34d399");
          break;

        case "docker_log": {
          const text = data.text;
          if (text) {
            addLog("output", text, agentId, "#888888");
          }
          break;
        }

        case "docker_stop":
          setContainers((prev) => {
            const next = new Map(prev);
            next.set(data.container_id, "stopped");
            return next;
          });
          addLog("docker", `Container ${data.container_id} stopped`, agentId, "#666");
          break;

        case "tool_result":
          addLog("result",
            `${data.tool}: ${data.status}${data.exit_code !== undefined ? ` (exit ${data.exit_code})` : ""}`,
            agentId,
            data.status === "success" ? "#4ade80" : "#ef4444"
          );
          break;

        case "finding":
          setFindings((prev) => [...prev, {
            title: data.title,
            severity: data.severity,
            target: data.target,
            agent: agentId || "unknown",
          }]);
          addLog("finding", `[${(data.severity || "").toUpperCase()}] ${data.title}`, agentId,
            data.severity === "critical" ? "#ef4444" : data.severity === "high" ? "#f59e0b" : "#4ade80"
          );
          break;

        case "handoff":
          addLog("handoff", `Handing off to ${data.agent}`, agentId, "#fbbf24");
          break;

        case "scan_complete":
          setStatus(data.status === "cancelled" ? "cancelled" : "completed");
          addLog("system", `Scan ${data.status} (${data.duration}, ${data.findings} findings)`, undefined, "#00d4ff");
          break;

        case "agent_error":
          addLog("error", `Agent error: ${data.error}`, agentId, "#ef4444");
          break;
      }
    });

    return () => {
      unsub();
      ws.unsubscribe(scanId);
    };
  }, [scanId, addLog]);

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleStartScan = async () => {
    if (!target.trim()) {
      setError("Enter a target domain");
      return;
    }

    if (!isAuthenticated()) {
      setError("Please log in to start a scan");
      return;
    }

    setError(null);
    setLogs([]);
    setFindings([]);
    setActiveAgents(new Set());
    setContainers(new Map());
    setStatus("running");

    try {
      const scan = await createScan({ target: target.trim(), scan_type: scanType } as ScanRequest);
      setScanId(scan.id);
      addLog("system", `Scan ${scan.id} queued for ${target}`, undefined, "#00d4ff");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message :
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to start scan";
      setError(message);
      setStatus("failed");
    }
  };

  const handleCancelScan = async () => {
    if (!scanId) return;
    try {
      await cancelScan(scanId);
      setStatus("cancelled");
      addLog("system", "Scan cancelled by user", undefined, "#f59e0b");
    } catch {
      setError("Failed to cancel scan");
    }
  };

  const handleReset = () => {
    setScanId(null);
    setStatus("idle");
    setLogs([]);
    setFindings([]);
    setActiveAgents(new Set());
    setContainers(new Map());
    setError(null);
  };

  const runningContainers = Array.from(containers.values()).filter((s) => s === "running").length;
  const selectedType = SCAN_TYPES.find((t) => t.id === scanType)!;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="border-b border-white/[0.06] bg-[#08080d]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/">
            <a className="flex items-center gap-2 text-[#555] hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs font-mono">HARBINGER</span>
            </a>
          </Link>
          <div className="w-px h-5 bg-white/[0.06]" />
          <h1 className="text-sm font-display font-semibold">Security Scanner</h1>

          {/* Live indicators */}
          {status === "running" && (
            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <motion.span
                  className="w-2 h-2 rounded-full bg-[#4ade80]"
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-[10px] font-mono text-[#4ade80]">SCANNING</span>
              </div>
              <span className="text-[10px] font-mono text-[#555]">
                {activeAgents.size} agents
              </span>
              <span className="text-[10px] font-mono text-[#00d4ff]">
                {runningContainers} containers
              </span>
              <span className="text-[10px] font-mono text-[#ef4444]">
                {findings.length} findings
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {status === "idle" ? (
          /* ── Scan Setup ── */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-display font-bold mb-2">Start a Security Scan</h2>
              <p className="text-[#666] text-sm">
                Enter a target domain and select scan type. Real agents will spawn Docker containers
                and execute security tools.
              </p>
            </div>

            {/* Target input */}
            <div className="mb-6">
              <label className="text-[10px] font-mono text-[#555] uppercase tracking-wider mb-2 block">
                Target Domain
              </label>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="example.com"
                className="w-full bg-[#0d0d15] border border-white/[0.08] rounded-lg px-4 py-3 text-sm font-mono text-white placeholder-[#333] focus:outline-none focus:border-[#00d4ff]/40 transition-colors"
                onKeyDown={(e) => e.key === "Enter" && handleStartScan()}
              />
            </div>

            {/* Scan type selection */}
            <div className="mb-6">
              <label className="text-[10px] font-mono text-[#555] uppercase tracking-wider mb-3 block">
                Scan Type
              </label>
              <div className="grid gap-2">
                {SCAN_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = scanType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setScanType(type.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                        isSelected
                          ? "border-[#00d4ff]/30 bg-[#00d4ff]/[0.04]"
                          : "border-white/[0.06] bg-[#0d0d15] hover:border-white/[0.12]"
                      }`}
                    >
                      <Icon className={`w-5 h-5 shrink-0 ${isSelected ? "text-[#00d4ff]" : "text-[#555]"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${isSelected ? "text-white" : "text-[#999]"}`}>
                            {type.label}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-[#555]">
                            {type.cost} {type.cost === 1 ? "credit" : "credits"}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#555] mt-0.5">{type.desc}</p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 shrink-0 ${
                          isSelected ? "border-[#00d4ff] bg-[#00d4ff]" : "border-[#333]"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              onClick={handleStartScan}
              className="w-full py-3 rounded-lg bg-[#00d4ff] text-black font-display font-semibold text-sm hover:bg-[#00d4ff]/90 transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              Launch {selectedType.label} ({selectedType.cost} credits)
            </button>
          </motion.div>
        ) : (
          /* ── Live Scan View ── */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main log output */}
            <div className="lg:col-span-2">
              <div className="rounded-lg border border-white/[0.06] bg-[#0d0d15] overflow-hidden">
                {/* Log header */}
                <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.06] bg-[#08080d]">
                  <Terminal className="w-3.5 h-3.5 text-[#555]" />
                  <span className="text-[10px] font-mono text-[#555] uppercase tracking-wider">
                    Live Output
                  </span>
                  <span className="text-[10px] font-mono text-[#333] ml-auto">
                    {target} — {selectedType.label}
                  </span>
                </div>

                {/* Log content */}
                <div className="h-[500px] overflow-y-auto p-3 font-mono text-xs space-y-0.5">
                  <AnimatePresence initial={false}>
                    {logs.map((log) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-2 py-0.5"
                      >
                        <span className="text-[#333] shrink-0 w-16 text-right">
                          {log.timestamp.toLocaleTimeString("en-US", { hour12: false })}
                        </span>
                        {log.agentId && (
                          <span
                            className="shrink-0 w-20 text-right font-semibold"
                            style={{ color: AGENT_COLORS[log.agentId] || "#888" }}
                          >
                            [{log.agentId.toUpperCase().slice(0, 8)}]
                          </span>
                        )}
                        <span style={{ color: log.color || "#999" }}>{log.text}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={logEndRef} />

                  {status === "running" && (
                    <div className="flex items-center gap-2 text-[#555] py-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Waiting for output...</span>
                    </div>
                  )}
                </div>

                {/* Log footer */}
                <div className="flex items-center gap-2 px-4 py-2 border-t border-white/[0.06] bg-[#08080d]">
                  {status === "running" ? (
                    <button
                      onClick={handleCancelScan}
                      className="flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-mono bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20 transition-colors"
                    >
                      <Square className="w-3 h-3" />
                      Cancel Scan
                    </button>
                  ) : (
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-mono bg-[#00d4ff]/10 text-[#00d4ff] hover:bg-[#00d4ff]/20 transition-colors"
                    >
                      New Scan
                    </button>
                  )}
                  <span className="ml-auto text-[10px] font-mono text-[#333]">
                    {logs.length} lines
                  </span>
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-4">
              {/* Status card */}
              <div className="rounded-lg border border-white/[0.06] bg-[#0d0d15] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-[#555]" />
                  <span className="text-[10px] font-mono text-[#555] uppercase tracking-wider">
                    Scan Status
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#666]">Status</span>
                    <span className={`text-xs font-mono flex items-center gap-1 ${
                      status === "running" ? "text-[#4ade80]" :
                      status === "completed" ? "text-[#00d4ff]" :
                      status === "failed" ? "text-[#ef4444]" : "text-[#f59e0b]"
                    }`}>
                      {status === "running" && <Loader2 className="w-3 h-3 animate-spin" />}
                      {status === "completed" && <CheckCircle2 className="w-3 h-3" />}
                      {status === "failed" && <XCircle className="w-3 h-3" />}
                      {status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#666]">Target</span>
                    <span className="text-xs font-mono text-white">{target}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#666]">Active Agents</span>
                    <span className="text-xs font-mono text-[#00d4ff]">{activeAgents.size}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#666]">Containers</span>
                    <span className="text-xs font-mono text-[#34d399]">{runningContainers}</span>
                  </div>
                </div>
              </div>

              {/* Active agents */}
              {activeAgents.size > 0 && (
                <div className="rounded-lg border border-white/[0.06] bg-[#0d0d15] p-4">
                  <div className="text-[10px] font-mono text-[#555] uppercase tracking-wider mb-3">
                    Active Agents
                  </div>
                  <div className="space-y-1.5">
                    {Array.from(activeAgents).map((agentId) => (
                      <div key={agentId} className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: AGENT_COLORS[agentId] }}
                        />
                        <span className="text-[11px] font-mono" style={{ color: AGENT_COLORS[agentId] }}>
                          {agentId.toUpperCase()}
                        </span>
                        {status === "running" && (
                          <motion.span
                            className="ml-auto w-1.5 h-1.5 rounded-full bg-[#4ade80]"
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Findings */}
              <div className="rounded-lg border border-white/[0.06] bg-[#0d0d15] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-[#555]" />
                  <span className="text-[10px] font-mono text-[#555] uppercase tracking-wider">
                    Findings ({findings.length})
                  </span>
                </div>
                {findings.length === 0 ? (
                  <p className="text-[11px] text-[#333]">No findings yet</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {findings.map((f, i) => (
                      <div key={i} className="p-2 rounded bg-white/[0.02] border border-white/[0.04]">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                            f.severity === "critical" ? "bg-[#ef4444]/20 text-[#ef4444]" :
                            f.severity === "high" ? "bg-[#f59e0b]/20 text-[#f59e0b]" :
                            f.severity === "medium" ? "bg-[#fbbf24]/20 text-[#fbbf24]" :
                            "bg-[#4ade80]/20 text-[#4ade80]"
                          }`}>
                            {f.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#999]">{f.title}</p>
                        <p className="text-[10px] text-[#555] mt-0.5">{f.target}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Credits */}
              <Link href="/pricing">
                <a className="block rounded-lg border border-white/[0.06] bg-[#0d0d15] p-4 hover:border-[#00d4ff]/20 transition-colors">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#555]" />
                    <span className="text-[10px] font-mono text-[#555] uppercase tracking-wider">
                      Need more credits?
                    </span>
                  </div>
                  <p className="text-[11px] text-[#00d4ff] mt-1">Purchase credit packs →</p>
                </a>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
