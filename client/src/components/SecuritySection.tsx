import SectionWrapper, { SectionDesc, SectionLabel, SectionTitle } from "./SectionWrapper";
import { Shield, Lock, Eye, Key, Server, AlertTriangle, Target, FileCheck, OctagonX } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface SecurityFeature {
  icon: LucideIcon;
  title: string;
  items: string[];
}

const features: SecurityFeature[] = [
  {
    icon: Key,
    title: "Authentication",
    items: [
      "3 login methods: OAuth, Device Flow, PAT",
      "JWT with configurable secret validation",
      "OAuth CSRF protection with server-side state",
      "HMAC-SHA256 TOTP verification",
    ],
  },
  {
    icon: Shield,
    title: "API Security",
    items: [
      "Bearer token auth on all protected routes",
      "Sliding-window rate limiting per IP",
      "Request body size limits (maxBodyMiddleware)",
      "Error sanitization — no internal details leaked",
    ],
  },
  {
    icon: Server,
    title: "Infrastructure",
    items: [
      "Docker action whitelist (start/stop/restart only)",
      "PostgreSQL with pgvector — parameterized queries",
      "Nginx reverse proxy with security headers",
      "All service ports configurable via env vars",
    ],
  },
  {
    icon: Lock,
    title: "Frontend",
    items: [
      "No hardcoded secrets or API keys",
      "All API calls use Authorization headers",
      "Setup wizard validates auth before completion",
      "Backend-down detection with clear user guidance",
    ],
  },
  {
    icon: Eye,
    title: "Observability",
    items: [
      "Health checks on every Docker service",
      "Structured server-side error logging",
      "CORS enforcement with origin validation",
      "Audit trail for agent operations",
    ],
  },
  {
    icon: AlertTriangle,
    title: "Input Validation",
    items: [
      "Skill ID validation against allowlists",
      "SQL field name whitelisting (no injection)",
      "Docker action parameter sanitization",
      "Setup guard — prevents re-setup after config",
    ],
  },
  {
    icon: Target,
    title: "Target Validation",
    items: [
      "8 built-in rules: RFC1918, loopback, link-local, metadata",
      "Cloud metadata blocking (169.254.169.254)",
      "Custom allow/block rule management",
      "Pre-execution validation for all operations",
    ],
  },
  {
    icon: FileCheck,
    title: "Approval Workflows",
    items: [
      "High-risk operations require explicit approval",
      "Pending → approved/rejected with reviewer tracking",
      "24-hour auto-expiry on unreviewed requests",
      "10,000-entry audit trail with severity levels",
    ],
  },
  {
    icon: OctagonX,
    title: "Kill Switch & Scope",
    items: [
      "Global kill switch halts all operations instantly",
      "Scope enforcement with exclude-always-wins model",
      "Per-operation rate limiting (minute/hour/concurrent)",
      "Sliding window counters with auto-cleanup",
    ],
  },
];

export default function SecuritySection() {
  return (
    <SectionWrapper id="security">
      <SectionLabel>Security</SectionLabel>
      <SectionTitle>Hardened for real-world deployment.</SectionTitle>
      <SectionDesc>
        Built by security engineers for security engineers. Every layer audited.
      </SectionDesc>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-14">
        {features.map((f) => (
          <div key={f.title} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.03] transition-colors group">
            <div className="flex items-center gap-2.5 mb-4">
              <f.icon className="w-4 h-4 text-[#555] group-hover:text-[#00d4ff] transition-colors" />
              <h3 className="font-display font-semibold text-white text-[13px]">{f.title}</h3>
            </div>
            <div className="space-y-2">
              {f.items.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px] text-[#666] leading-relaxed">
                  <span className="text-[#333] mt-0.5 shrink-0">—</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
