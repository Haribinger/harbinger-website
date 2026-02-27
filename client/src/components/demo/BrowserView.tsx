import type { BrowserState } from "@/lib/demo/types";
import { motion } from "framer-motion";

interface BrowserViewProps {
  state: BrowserState | null;
  collapsed?: boolean;
}

function StatusBadge({ code }: { code: number }) {
  const color = code < 300 ? "#4ade80" : code < 400 ? "#f59e0b" : "#ef4444";
  return (
    <span
      className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded"
      style={{ color, backgroundColor: color + "15" }}
    >
      {code}
    </span>
  );
}

function PageContent({ state }: { state: BrowserState }) {
  const url = state.url;
  const isJenkins =
    url.includes("ci.") || url.includes("jenkins") || url.includes(":8080");
  const isLogin = url.includes("login") || url.includes("admin");
  const isApi =
    url.includes("/api") ||
    url.includes("graphql") ||
    url.includes("swagger");
  const isEnv = url.includes(".env");

  if (isEnv) {
    return (
      <div className="p-3 font-mono text-[10px] space-y-0.5">
        <div className="text-[#ef4444]"># Environment Variables — EXPOSED</div>
        <div>
          <span className="text-[#f59e0b]">DB_HOST</span>=
          <span className="text-[#4ade80]">prod-rds.internal</span>
        </div>
        <div>
          <span className="text-[#f59e0b]">DB_USER</span>=
          <span className="text-[#4ade80]">admin</span>
        </div>
        <div>
          <span className="text-[#f59e0b]">DB_PASS</span>=
          <span className="text-[#ef4444]">s3cr3t_pr0d_2024!</span>
        </div>
        <div>
          <span className="text-[#f59e0b]">JWT_SECRET</span>=
          <span className="text-[#ef4444]">harbinger-super-secret</span>
        </div>
        <div>
          <span className="text-[#f59e0b]">STRIPE_SK</span>=
          <span className="text-[#ef4444]">sk_live_4eC39HqLyjW...</span>
        </div>
        <div>
          <span className="text-[#f59e0b]">AWS_ACCESS</span>=
          <span className="text-[#ef4444]">AKIAIOSFODNN7EXAM...</span>
        </div>
        <div className="text-[#555]"># ...</div>
      </div>
    );
  }

  if (isJenkins) {
    return (
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2 pb-2 border-b border-white/[0.04]">
          <div className="w-6 h-6 rounded bg-[#d33833] flex items-center justify-center text-white text-[9px] font-bold">
            J
          </div>
          <span className="text-[12px] font-medium text-white">
            Jenkins Dashboard
          </span>
          <span className="text-[9px] text-[#ef4444] ml-auto">
            v2.401 (VULNERABLE)
          </span>
        </div>
        <div className="space-y-1">
          {["main-pipeline", "deploy-prod", "security-scan", "backup-job"].map(
            (job, i) => (
              <div
                key={job}
                className="flex items-center gap-2 px-2 py-1 rounded bg-white/[0.02]"
              >
                <span
                  className={`w-2 h-2 rounded-full ${i === 0 ? "bg-[#4ade80]" : "bg-[#555]"}`}
                />
                <span className="text-[10px] font-mono text-[#999]">
                  {job}
                </span>
              </div>
            )
          )}
        </div>
        <div className="mt-2 px-2 py-1.5 rounded bg-[#ef4444]/10 border border-[#ef4444]/20">
          <span className="text-[9px] text-[#ef4444] font-mono">
            ⚠ CLI endpoint exposed — CVE-2024-23897
          </span>
        </div>
      </div>
    );
  }

  if (isApi) {
    return (
      <div className="p-3 space-y-2">
        <div className="text-[11px] font-medium text-[#4ade80]">
          Swagger UI / API Documentation
        </div>
        <div className="space-y-1 font-mono text-[10px]">
          <div className="flex gap-2">
            <span className="text-[#4ade80] w-10">GET</span>
            <span className="text-[#999]">/api/v1/users</span>
          </div>
          <div className="flex gap-2">
            <span className="text-[#f59e0b] w-10">POST</span>
            <span className="text-[#999]">/api/v1/auth/login</span>
          </div>
          <div className="flex gap-2">
            <span className="text-[#ef4444] w-10">DELETE</span>
            <span className="text-[#999]">/api/v1/users/:id</span>
          </div>
          <div className="flex gap-2">
            <span className="text-[#00d4ff] w-10">PUT</span>
            <span className="text-[#999]">/api/v1/admin/config</span>
          </div>
        </div>
      </div>
    );
  }

  if (isLogin) {
    return (
      <div className="p-4 flex flex-col items-center gap-3">
        <div className="text-[12px] font-medium text-white">Admin Login</div>
        <div className="w-full max-w-[180px] space-y-2">
          <div className="h-6 rounded border border-white/[0.08] bg-white/[0.03] px-2 flex items-center">
            <span className="text-[9px] text-[#555]">admin@example.com</span>
          </div>
          <div className="h-6 rounded border border-white/[0.08] bg-white/[0.03] px-2 flex items-center">
            <span className="text-[9px] text-[#555]">••••••••</span>
          </div>
          <div className="h-6 rounded bg-[#00d4ff]/20 flex items-center justify-center">
            <span className="text-[9px] text-[#00d4ff] font-medium">
              Sign In
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Generic page
  return (
    <div className="p-3 space-y-2">
      <div className="h-3 w-2/3 rounded bg-white/[0.06]" />
      <div className="h-2 w-full rounded bg-white/[0.03]" />
      <div className="h-2 w-5/6 rounded bg-white/[0.03]" />
      <div className="h-2 w-4/5 rounded bg-white/[0.03]" />
      <div className="h-8 w-full rounded bg-white/[0.02] mt-3" />
      <div className="h-2 w-3/4 rounded bg-white/[0.03]" />
    </div>
  );
}

export default function BrowserView({ state, collapsed }: BrowserViewProps) {
  if (collapsed || !state) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col rounded-lg border border-white/[0.06] bg-[#0c0c12] overflow-hidden"
    >
      {/* Chrome-like top bar */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.02] border-b border-white/[0.04]">
        <div className="w-2 h-2 rounded-full bg-[#ff5f57]" />
        <div className="w-2 h-2 rounded-full bg-[#febc2e]" />
        <div className="w-2 h-2 rounded-full bg-[#28c840]" />
        <div className="flex-1 mx-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.04]">
          <svg
            width="10"
            height="10"
            viewBox="0 0 16 16"
            fill="none"
            className="text-[#555] shrink-0"
          >
            <path
              d="M8 1a7 7 0 110 14A7 7 0 018 1z"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <path
              d="M1 8h14M8 1c2 2 3 4.5 3 7s-1 5-3 7M8 1c-2 2-3 4.5-3 7s1 5 3 7"
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
          <span className="text-[9px] font-mono text-[#888] truncate">
            {state.url}
          </span>
          <StatusBadge code={state.statusCode} />
        </div>
      </div>

      {/* Page content */}
      <div className="relative min-h-[160px] max-h-[220px] overflow-hidden">
        <PageContent state={state} />

        {/* Agent scanning overlay */}
        {state.agentOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-[#0a0a0f]/60 backdrop-blur-[1px] flex items-center justify-center"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0a0a0f]/90 border border-[#00d4ff]/20">
              <motion.div
                className="w-3 h-3 border-2 border-[#00d4ff] border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              <span className="text-[10px] font-mono text-[#00d4ff]">
                {state.agentOverlay}
              </span>
            </div>
          </motion.div>
        )}

        {/* Action log */}
        {state.actions.length > 0 && (
          <div className="absolute bottom-1 right-1 flex flex-col gap-0.5">
            {state.actions.slice(-3).map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 4 }}
                animate={{ opacity: 1, x: 0 }}
                className="px-1.5 py-0.5 rounded bg-[#a78bfa]/20 border border-[#a78bfa]/20"
              >
                <span className="text-[8px] font-mono text-[#a78bfa]">
                  {a.type}: &quot;{a.target}&quot;
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
