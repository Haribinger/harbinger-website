import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Shield,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  Filter,
  Download,
  Search,
  Globe,
  Clock,
  Target,
  Zap,
  FileText,
  Bug,
  Lock,
  Server,
  Code,
  Eye,
} from "lucide-react";

// ── Types ──

type Severity = "critical" | "high" | "medium" | "low" | "info";

interface Finding {
  id: string;
  title: string;
  severity: Severity;
  category: string;
  target: string;
  evidence: string;
  description: string;
  remediation: string;
  cvss?: number;
  cve?: string;
  agent: string;
  timestamp: string;
}

// ── Mock Data ──

const FINDINGS: Finding[] = [
  {
    id: "F-001",
    title: "SQL Injection in /api/users endpoint",
    severity: "critical",
    category: "Injection",
    target: "api.example.com/api/users?id=1",
    evidence: "Parameter 'id' is vulnerable to time-based blind SQL injection. Payload: 1' AND SLEEP(5)-- resulted in 5.02s response delay.",
    description: "The application constructs SQL queries using unsanitized user input, allowing attackers to execute arbitrary SQL commands against the database.",
    remediation: "Use parameterized queries or prepared statements. Implement input validation and WAF rules.",
    cvss: 9.8,
    cve: "CWE-89",
    agent: "BREACH",
    timestamp: "2 hours ago",
  },
  {
    id: "F-002",
    title: "Exposed Admin Panel with Default Credentials",
    severity: "critical",
    category: "Authentication",
    target: "admin.example.com/login",
    evidence: "Admin panel accessible at /admin. Default credentials admin:admin123 accepted.",
    description: "The administrative interface is publicly accessible and protected by default credentials.",
    remediation: "Change default credentials immediately. Restrict admin panel to internal network. Implement MFA.",
    cvss: 9.1,
    agent: "PHANTOM",
    timestamp: "2 hours ago",
  },
  {
    id: "F-003",
    title: "Cross-Site Scripting (XSS) in Search",
    severity: "high",
    category: "XSS",
    target: "example.com/search?q=<script>alert(1)</script>",
    evidence: "Reflected XSS confirmed. Injected payload executed in browser context without sanitization.",
    description: "User input in the search parameter is reflected in the page without proper encoding.",
    remediation: "Implement output encoding. Use Content-Security-Policy headers. Validate and sanitize all user inputs.",
    cvss: 7.5,
    cve: "CWE-79",
    agent: "BREACH",
    timestamp: "2 hours ago",
  },
  {
    id: "F-004",
    title: "TLS 1.0 and 1.1 Enabled",
    severity: "medium",
    category: "Cryptography",
    target: "api.example.com:443",
    evidence: "Server accepts TLSv1.0 and TLSv1.1 connections. These protocols have known vulnerabilities.",
    description: "Outdated TLS versions are enabled, exposing the server to BEAST and POODLE attacks.",
    remediation: "Disable TLS 1.0 and 1.1. Only allow TLS 1.2+ with strong cipher suites.",
    cvss: 5.3,
    agent: "SENTINEL",
    timestamp: "2 hours ago",
  },
  {
    id: "F-005",
    title: "Missing Security Headers",
    severity: "medium",
    category: "Configuration",
    target: "example.com",
    evidence: "Missing: X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security, Content-Security-Policy",
    description: "The server does not set important security headers that protect against common web attacks.",
    remediation: "Add security headers: HSTS, X-Content-Type-Options: nosniff, X-Frame-Options: DENY, CSP.",
    cvss: 4.3,
    agent: "SENTINEL",
    timestamp: "2 hours ago",
  },
  {
    id: "F-006",
    title: "Open Ports: 22, 80, 443, 8080, 3306",
    severity: "low",
    category: "Network",
    target: "example.com",
    evidence: "Port scan revealed: 22/tcp (SSH), 80/tcp (HTTP), 443/tcp (HTTPS), 8080/tcp (HTTP-Alt), 3306/tcp (MySQL)",
    description: "Multiple ports are exposed, including MySQL (3306) which should not be publicly accessible.",
    remediation: "Close unnecessary ports. Move MySQL behind firewall. Restrict SSH access to known IPs.",
    cvss: 3.7,
    agent: "PATHFINDER",
    timestamp: "2 hours ago",
  },
  {
    id: "F-007",
    title: "DNS Zone Transfer Allowed",
    severity: "low",
    category: "DNS",
    target: "ns1.example.com",
    evidence: "AXFR query successful. Obtained 47 DNS records including internal hostnames.",
    description: "DNS zone transfers are not restricted, leaking internal infrastructure details.",
    remediation: "Restrict zone transfers to authorized secondary DNS servers only.",
    cvss: 3.1,
    agent: "PATHFINDER",
    timestamp: "2 hours ago",
  },
  {
    id: "F-008",
    title: "Server Version Disclosure",
    severity: "info",
    category: "Information",
    target: "api.example.com",
    evidence: "Server header: nginx/1.21.6. X-Powered-By: Express 4.18.2",
    description: "Server response headers reveal the web server and framework versions.",
    remediation: "Remove or obfuscate Server and X-Powered-By headers.",
    agent: "SENTINEL",
    timestamp: "2 hours ago",
  },
];

const SEVERITY_CONFIG: Record<Severity, { color: string; bg: string; label: string }> = {
  critical: { color: "#ef4444", bg: "bg-[#ef4444]/10", label: "CRITICAL" },
  high: { color: "#f97316", bg: "bg-[#f97316]/10", label: "HIGH" },
  medium: { color: "#f59e0b", bg: "bg-[#f59e0b]/10", label: "MEDIUM" },
  low: { color: "#3b82f6", bg: "bg-[#3b82f6]/10", label: "LOW" },
  info: { color: "#6b7280", bg: "bg-[#6b7280]/10", label: "INFO" },
};

// ── Components ──

function ScanHeader() {
  return (
    <div className="bg-[#0d0d14] border border-white/[0.04] rounded-lg p-5 mb-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-lg font-semibold text-white">example.com</h2>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-[#22c55e]/10 text-[#22c55e] rounded">COMPLETED</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-[#555]">
            <span className="flex items-center gap-1"><Target className="w-3 h-3" /> Full Audit</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 4m 32s</span>
            <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> 6 agents deployed</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded text-[12px] text-[#888] hover:bg-white/[0.08] transition-colors">
            <Download className="w-3.5 h-3.5" />
            Export PDF
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded text-[12px] text-[#888] hover:bg-white/[0.08] transition-colors">
            <FileText className="w-3.5 h-3.5" />
            JSON
          </button>
        </div>
      </div>

      {/* Severity summary */}
      <div className="flex items-center gap-3">
        {(Object.entries(SEVERITY_CONFIG) as [Severity, typeof SEVERITY_CONFIG.critical][]).map(([sev, cfg]) => {
          const count = FINDINGS.filter((f) => f.severity === sev).length;
          return (
            <div
              key={sev}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded"
              style={{ backgroundColor: `${cfg.color}10` }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
              <span className="text-[11px] font-mono" style={{ color: cfg.color }}>
                {count} {cfg.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FindingCard({ finding, expanded, onToggle }: { finding: Finding; expanded: boolean; onToggle: () => void }) {
  const cfg = SEVERITY_CONFIG[finding.severity];
  const [copied, setCopied] = useState(false);

  const copyEvidence = () => {
    navigator.clipboard.writeText(finding.evidence);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0d0d14] border border-white/[0.04] rounded-lg overflow-hidden hover:border-white/[0.06] transition-colors">
      {/* Header */}
      <button onClick={onToggle} className="w-full flex items-center gap-3 p-4 text-left">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${cfg.color}15` }}>
          {finding.severity === "critical" ? <AlertTriangle className="w-4 h-4" style={{ color: cfg.color }} /> :
           finding.severity === "high" ? <Bug className="w-4 h-4" style={{ color: cfg.color }} /> :
           finding.severity === "medium" ? <Shield className="w-4 h-4" style={{ color: cfg.color }} /> :
           <Eye className="w-4 h-4" style={{ color: cfg.color }} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-white font-medium truncate">{finding.title}</span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-[11px] text-[#555]">
            <span>{finding.category}</span>
            <span>{finding.target}</span>
            {finding.cvss && <span>CVSS {finding.cvss}</span>}
          </div>
        </div>
        <span className={`px-2 py-0.5 text-[10px] font-mono rounded shrink-0 ${cfg.bg}`} style={{ color: cfg.color }}>
          {cfg.label}
        </span>
        {expanded ? <ChevronDown className="w-4 h-4 text-[#555] shrink-0" /> : <ChevronRight className="w-4 h-4 text-[#555] shrink-0" />}
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-white/[0.03] p-4 space-y-4">
          <div>
            <h4 className="text-[11px] text-[#555] uppercase tracking-wider mb-2">Description</h4>
            <p className="text-[12px] text-[#aaa] leading-relaxed">{finding.description}</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[11px] text-[#555] uppercase tracking-wider">Evidence</h4>
              <button onClick={copyEvidence} className="text-[#555] hover:text-white transition-colors">
                {copied ? <Check className="w-3.5 h-3.5 text-[#22c55e]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <pre className="text-[11px] font-mono text-[#888] bg-[#08080d] border border-white/[0.03] rounded p-3 overflow-x-auto whitespace-pre-wrap">
              {finding.evidence}
            </pre>
          </div>

          <div>
            <h4 className="text-[11px] text-[#555] uppercase tracking-wider mb-2">Remediation</h4>
            <p className="text-[12px] text-[#22c55e]/80 leading-relaxed">{finding.remediation}</p>
          </div>

          <div className="flex items-center gap-4 pt-2 text-[10px] text-[#444]">
            {finding.cve && <span className="font-mono">{finding.cve}</span>}
            <span>Agent: {finding.agent}</span>
            <span>{finding.timestamp}</span>
            <span className="font-mono">{finding.id}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main ──

export default function ScanResults() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["F-001"]));
  const [filterSeverity, setFilterSeverity] = useState<Severity | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = FINDINGS.filter((f) => {
    if (filterSeverity !== "all" && f.severity !== filterSeverity) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return f.title.toLowerCase().includes(q) || f.category.toLowerCase().includes(q) || f.target.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="container max-w-5xl mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[11px] text-[#555] mb-4">
            <a href="/dashboard" className="hover:text-[#888] transition-colors">Dashboard</a>
            <ChevronRight className="w-3 h-3" />
            <a href="/scan" className="hover:text-[#888] transition-colors">Scans</a>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#888]">scan-001</span>
          </div>

          <ScanHeader />

          {/* Filters */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
              <input
                type="text"
                placeholder="Search findings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search findings"
                className="w-full bg-[#0d0d14] border border-white/[0.04] rounded-lg pl-9 pr-3 py-2 text-[13px] text-white placeholder-[#444] focus:border-[#00d4ff]/30 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex items-center gap-1 bg-[#0d0d14] border border-white/[0.04] rounded-lg p-1">
              <button
                onClick={() => setFilterSeverity("all")}
                className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                  filterSeverity === "all" ? "bg-white/[0.06] text-white" : "text-[#555] hover:text-[#888]"
                }`}
              >
                All
              </button>
              {(Object.entries(SEVERITY_CONFIG) as [Severity, typeof SEVERITY_CONFIG.critical][]).map(([sev, cfg]) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                    filterSeverity === sev ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
                  }`}
                  style={{ color: filterSeverity === sev ? cfg.color : "#555" }}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Findings */}
          <div className="space-y-2">
            {filtered.map((f) => (
              <FindingCard key={f.id} finding={f} expanded={expanded.has(f.id)} onToggle={() => toggle(f.id)} />
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-[#444]">
                <Shield className="w-8 h-8 mx-auto mb-3 opacity-50" />
                <p className="text-[13px]">No findings match your filters</p>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="mt-6 text-center text-[11px] text-[#444] font-mono">
            Showing {filtered.length} of {FINDINGS.length} findings
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
