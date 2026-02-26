import SectionWrapper, { SectionDesc, SectionLabel, SectionTitle } from "./SectionWrapper";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="absolute top-2 right-2 p-1.5 rounded bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
    >
      {copied ? <Check className="w-3 h-3 text-[#4ade80]" /> : <Copy className="w-3 h-3 text-[#555]" />}
    </button>
  );
}

const steps = [
  {
    step: "1",
    title: "Clone & configure",
    code: `git clone https://github.com/Haribinger/Harbinger.git
cd Harbinger
cp .env.example .env  # edit with your GitHub OAuth keys`,
  },
  {
    step: "2",
    title: "Start the stack",
    code: `docker compose up -d`,
    note: "Starts 9 services: PostgreSQL, Redis, Neo4j, Go backend, React frontend, 4 MCP plugins, and Nginx.",
  },
  {
    step: "3",
    title: "Open the command center",
    code: `# Frontend:  http://localhost:3000
# Dashboard: http://localhost:80
# Backend:   http://localhost:8080/api/health`,
    note: "Login with GitHub OAuth, Device Flow, or a personal access token.",
  },
];

export default function QuickstartSection() {
  return (
    <SectionWrapper id="quickstart">
      <SectionLabel>Quickstart</SectionLabel>
      <SectionTitle>Up and running in 60 seconds.</SectionTitle>
      <SectionDesc>
        Three commands. Nine services. Full offensive security platform.
      </SectionDesc>

      <div className="mt-14 space-y-6 max-w-2xl">
        {steps.map((s) => (
          <div key={s.step} className="rounded-lg border border-white/[0.06] overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.04]">
              <span className="w-5 h-5 rounded-full bg-[#00d4ff]/10 text-[#00d4ff] text-[11px] font-mono flex items-center justify-center font-bold">{s.step}</span>
              <span className="font-display text-[13px] font-semibold text-white">{s.title}</span>
            </div>
            <div className="relative p-4 bg-[#0c0c12]">
              <CopyBtn text={s.code} />
              <pre className="font-mono text-[11px] leading-[1.8] text-[#4ade80] whitespace-pre-wrap pr-8">{s.code}</pre>
              {s.note && (
                <p className="mt-3 pt-3 border-t border-white/[0.04] font-mono text-[10px] text-[#555] leading-relaxed">{s.note}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Docker services grid */}
      <div className="mt-10 max-w-2xl">
        <h4 className="font-mono text-[11px] text-[#555] uppercase tracking-wider mb-4">What starts</h4>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {[
            { name: "PostgreSQL", port: "5432", color: "#336791" },
            { name: "Redis", port: "6379", color: "#dc382d" },
            { name: "Neo4j", port: "7474", color: "#008cc1" },
            { name: "Go API", port: "8080", color: "#00add8" },
            { name: "React UI", port: "3000", color: "#61dafb" },
            { name: "HexStrike", port: "3001", color: "#f59e0b" },
            { name: "PentAGI", port: "3002", color: "#a78bfa" },
            { name: "MCP-UI", port: "3003", color: "#4ade80" },
            { name: "RedTeam", port: "3004", color: "#ef4444" },
            { name: "Nginx", port: "80", color: "#009639" },
          ].map((svc) => (
            <div key={svc.name} className="rounded border border-white/[0.06] bg-white/[0.02] p-2.5 text-center hover:bg-white/[0.04] transition-colors">
              <div className="w-1.5 h-1.5 rounded-full mx-auto mb-1.5" style={{ backgroundColor: svc.color }} />
              <div className="font-mono text-[10px] text-white">{svc.name}</div>
              <div className="font-mono text-[9px] text-[#444]">:{svc.port}</div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
