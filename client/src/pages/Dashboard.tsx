import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Activity,
  Shield,
  CreditCard,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Zap,
  TrendingUp,
  BarChart3,
  Eye,
  Download,
  Play,
} from "lucide-react";

// ── Types ──

interface ScanHistoryItem {
  id: string;
  target: string;
  type: string;
  status: "completed" | "running" | "failed" | "queued";
  findings: number;
  critical: number;
  startedAt: string;
  duration: string;
}

interface CreditUsage {
  date: string;
  used: number;
  remaining: number;
}

interface FindingSummary {
  severity: "critical" | "high" | "medium" | "low" | "info";
  count: number;
  color: string;
}

// ── Mock Data ──

const RECENT_SCANS: ScanHistoryItem[] = [
  { id: "scan-001", target: "api.example.com", type: "Full Audit", status: "completed", findings: 23, critical: 2, startedAt: "2 hours ago", duration: "4m 32s" },
  { id: "scan-002", target: "staging.myapp.io", type: "Vuln Scan", status: "completed", findings: 8, critical: 0, startedAt: "5 hours ago", duration: "2m 18s" },
  { id: "scan-003", target: "prod.service.dev", type: "Recon", status: "running", findings: 5, critical: 0, startedAt: "12 min ago", duration: "—" },
  { id: "scan-004", target: "cloud.infra.co", type: "Cloud Audit", status: "failed", findings: 0, critical: 0, startedAt: "1 day ago", duration: "0m 45s" },
  { id: "scan-005", target: "legacy.corp.net", type: "OSINT", status: "completed", findings: 41, critical: 5, startedAt: "2 days ago", duration: "8m 12s" },
];

const CREDIT_HISTORY: CreditUsage[] = [
  { date: "Mon", used: 12, remaining: 88 },
  { date: "Tue", used: 8, remaining: 80 },
  { date: "Wed", used: 15, remaining: 65 },
  { date: "Thu", used: 5, remaining: 60 },
  { date: "Fri", used: 20, remaining: 40 },
  { date: "Sat", used: 3, remaining: 37 },
  { date: "Sun", used: 0, remaining: 37 },
];

const FINDINGS_SUMMARY: FindingSummary[] = [
  { severity: "critical", count: 7, color: "#ef4444" },
  { severity: "high", count: 18, color: "#f97316" },
  { severity: "medium", count: 34, color: "#f59e0b" },
  { severity: "low", count: 52, color: "#3b82f6" },
  { severity: "info", count: 89, color: "#6b7280" },
];

// ── Components ──

function StatCard({ icon, label, value, sub, accent }: { icon: React.ReactNode; label: string; value: string; sub?: string; accent: string }) {
  return (
    <div className="bg-[#0d0d14] border border-white/[0.04] rounded-lg p-4 hover:border-white/[0.08] transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${accent}15` }}>
          <div style={{ color: accent }}>{icon}</div>
        </div>
        <span className="text-[10px] font-mono text-[#444] uppercase">{label}</span>
      </div>
      <div className="text-2xl font-semibold text-white font-mono">{value}</div>
      {sub && <p className="text-[11px] text-[#555] mt-1">{sub}</p>}
    </div>
  );
}

function SeverityBar({ findings }: { findings: FindingSummary[] }) {
  const total = findings.reduce((s, f) => s + f.count, 0);
  return (
    <div className="space-y-3">
      <div className="flex h-2 rounded-full overflow-hidden bg-white/[0.03]">
        {findings.map((f) => (
          <div
            key={f.severity}
            className="transition-all duration-500"
            style={{ width: `${(f.count / total) * 100}%`, backgroundColor: f.color }}
          />
        ))}
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        {findings.map((f) => (
          <div key={f.severity} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }} />
            <span className="text-[11px] text-[#888] capitalize">{f.severity}</span>
            <span className="text-[11px] font-mono text-[#555]">{f.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CreditChart({ data }: { data: CreditUsage[] }) {
  const maxUsed = Math.max(...data.map((d) => d.used));
  return (
    <div className="flex items-end gap-2 h-24">
      {data.map((d) => (
        <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full relative" style={{ height: `${Math.max((d.used / (maxUsed || 1)) * 100, 4)}%` }}>
            <div
              className="absolute bottom-0 w-full rounded-t bg-gradient-to-t from-[#00d4ff]/60 to-[#00d4ff]/20 transition-all duration-300 hover:from-[#00d4ff]/80 hover:to-[#00d4ff]/40"
              style={{ height: "100%" }}
            />
          </div>
          <span className="text-[9px] font-mono text-[#444]">{d.date}</span>
        </div>
      ))}
    </div>
  );
}

function ScanRow({ scan }: { scan: ScanHistoryItem }) {
  const statusConfig = {
    completed: { icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "text-[#22c55e]", bg: "bg-[#22c55e]/10" },
    running: { icon: <Activity className="w-3.5 h-3.5 animate-pulse" />, color: "text-[#00d4ff]", bg: "bg-[#00d4ff]/10" },
    failed: { icon: <XCircle className="w-3.5 h-3.5" />, color: "text-[#ef4444]", bg: "bg-[#ef4444]/10" },
    queued: { icon: <Clock className="w-3.5 h-3.5" />, color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10" },
  };
  const cfg = statusConfig[scan.status];

  return (
    <div className="flex items-center gap-4 px-4 py-3 hover:bg-white/[0.015] transition-colors group">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${cfg.bg}`}>
        <span className={cfg.color}>{cfg.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-white font-medium truncate">{scan.target}</span>
          <span className="px-1.5 py-0.5 text-[10px] font-mono bg-white/[0.04] text-[#888] rounded shrink-0">
            {scan.type}
          </span>
        </div>
        <span className="text-[11px] text-[#555]">{scan.startedAt} · {scan.duration}</span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {scan.critical > 0 && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#ef4444]/10 text-[#ef4444] text-[11px] font-mono">
            <AlertTriangle className="w-3 h-3" />
            {scan.critical}
          </span>
        )}
        <span className="text-[12px] font-mono text-[#666]">{scan.findings} findings</span>
        <ChevronRight className="w-4 h-4 text-[#333] group-hover:text-[#888] transition-colors" />
      </div>
    </div>
  );
}

// ── Main ──

export default function Dashboard() {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="container max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-semibold text-white">{greeting}</h1>
              <p className="text-[13px] text-[#555] mt-1">Here's your security overview</p>
            </div>
            <a
              href="/scan"
              className="flex items-center gap-2 px-4 py-2 bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-lg text-[13px] text-[#00d4ff] font-medium hover:bg-[#00d4ff]/20 transition-colors"
            >
              <Play className="w-4 h-4" />
              New Scan
            </a>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <StatCard icon={<Target className="w-4 h-4" />} label="Total Scans" value="47" sub="+5 this week" accent="#00d4ff" />
            <StatCard icon={<AlertTriangle className="w-4 h-4" />} label="Open Findings" value="200" sub="7 critical" accent="#ef4444" />
            <StatCard icon={<Shield className="w-4 h-4" />} label="Targets" value="12" sub="3 new this month" accent="#22c55e" />
            <StatCard icon={<CreditCard className="w-4 h-4" />} label="Credits" value="37" sub="of 100 remaining" accent="#f59e0b" />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Findings Overview */}
            <div className="lg:col-span-2 bg-[#0d0d14] border border-white/[0.04] rounded-lg">
              <div className="p-4 border-b border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#8b5cf6]" />
                  <span className="text-[13px] font-medium">Findings Distribution</span>
                </div>
                <button className="flex items-center gap-1 text-[11px] text-[#555] hover:text-[#888] transition-colors">
                  <Download className="w-3 h-3" />
                  Export
                </button>
              </div>
              <div className="p-5">
                <SeverityBar findings={FINDINGS_SUMMARY} />
                <div className="mt-6 grid grid-cols-5 gap-3">
                  {FINDINGS_SUMMARY.map((f) => (
                    <div key={f.severity} className="text-center p-3 rounded-lg bg-white/[0.02]">
                      <div className="text-lg font-semibold font-mono" style={{ color: f.color }}>{f.count}</div>
                      <div className="text-[10px] text-[#555] capitalize mt-0.5">{f.severity}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Credit Usage */}
            <div className="bg-[#0d0d14] border border-white/[0.04] rounded-lg">
              <div className="p-4 border-b border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#00d4ff]" />
                  <span className="text-[13px] font-medium">Credit Usage</span>
                </div>
                <span className="text-[11px] font-mono text-[#444]">This week</span>
              </div>
              <div className="p-4">
                <CreditChart data={CREDIT_HISTORY} />
                <div className="mt-4 flex items-center justify-between text-[11px]">
                  <span className="text-[#555]">63 credits used</span>
                  <a href="/pricing" className="text-[#00d4ff] hover:text-[#00d4ff]/80 transition-colors flex items-center gap-1">
                    Buy more <Zap className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Scans */}
          <div className="bg-[#0d0d14] border border-white/[0.04] rounded-lg mb-6 overflow-hidden">
            <div className="p-4 border-b border-white/[0.04] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#22c55e]" />
                <span className="text-[13px] font-medium">Recent Scans</span>
              </div>
              <a href="/scan" className="text-[11px] text-[#555] hover:text-[#888] transition-colors flex items-center gap-1">
                View all <ChevronRight className="w-3 h-3" />
              </a>
            </div>
            <div className="divide-y divide-white/[0.03]">
              {RECENT_SCANS.map((scan) => (
                <ScanRow key={scan.id} scan={scan} />
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Full Audit", desc: "Complete security assessment", icon: <Shield className="w-5 h-5" />, color: "#00d4ff", href: "/scan" },
              { label: "View Reports", desc: "Download scan reports", icon: <Eye className="w-5 h-5" />, color: "#8b5cf6", href: "/scan" },
              { label: "API Keys", desc: "Manage your API access", icon: <Zap className="w-5 h-5" />, color: "#f59e0b", href: "/settings" },
              { label: "Integrations", desc: "Connect your tools", icon: <Activity className="w-5 h-5" />, color: "#22c55e", href: "/settings" },
            ].map((a) => (
              <a
                key={a.label}
                href={a.href}
                className="bg-[#0d0d14] border border-white/[0.04] rounded-lg p-4 hover:border-white/[0.08] transition-all group"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${a.color}10` }}>
                  <div style={{ color: a.color }} className="group-hover:scale-110 transition-transform">{a.icon}</div>
                </div>
                <div className="text-[13px] font-medium text-white">{a.label}</div>
                <div className="text-[11px] text-[#555] mt-0.5">{a.desc}</div>
              </a>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
