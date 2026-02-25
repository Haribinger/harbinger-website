import { useEffect, useRef, useState } from "react";

const HERO_BG = "https://private-us-east-1.manuscdn.com/sessionFile/QdNVf80RhSj4qt9n6tFkde/sandbox/36LBhrPt2JsliIuBm0wJkZ-img-1_1771976486000_na1fn_aGFyYmluZ2VyLWhlcm8tYmc.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvUWROVmY4MFJoU2o0cXQ5bjZ0RmtkZS9zYW5kYm94LzM2TEJoclB0MkpzbGlJdUJtMHdKa1otaW1nLTFfMTc3MTk3NjQ4NjAwMF9uYTFmbl9hR0Z5WW1sdVoyVnlMV2hsY204dFltYy5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=FzvSTpY5Wpf5piaLgLcyrahlkaL5NojDOuuXLRBvifTJ8k1ML0CxPY4DqaKjZUQGicMDns8ikKO0PQaq9Tm-xBmz-L7rgBzurs2d8AjGZQs9GR6D7Gi~d4h8kr2Sh67sM56hLd4DbLf2NNA4mbiqPpXBZ93hh9xPq3m9qpvx-Yn7XlLxPE3LMX9bfszxb0XZ3BGwHTnptECQmcoa8Cu2YNQ3J0hC19RA3VdOwSGI6UErmMT1L0U3KSDGAkfau0UdjX891nuMZx-P45LO6zv2n9gFYQUZN4gS9O318ImWSEnVlSM6hMIYAVgojHpKTSpXrW3vko4yV0dxzyIFtfnlCw__";

interface TermLine {
  ts: string;
  type: string;
  msg: string;
  cls: string;
}

const lines: TermLine[] = [
  { ts: "00:01.2", type: "PLAN", msg: "Recon target: example.com — enumerate subdomains, probe HTTP, run nuclei", cls: "text-[#888]" },
  { ts: "00:03.4", type: "TOOL_CALL", msg: "subfinder -d example.com -silent", cls: "text-[#00d4ff]" },
  { ts: "00:08.1", type: "TOOL_RESULT", msg: "47 subdomains discovered", cls: "text-[#4ade80]" },
  { ts: "00:08.9", type: "TOOL_CALL", msg: "httpx -l subs.txt -status-code -title -tech-detect", cls: "text-[#00d4ff]" },
  { ts: "00:14.3", type: "TOOL_RESULT", msg: "32 live hosts | 12 unique technologies detected", cls: "text-[#4ade80]" },
  { ts: "00:15.0", type: "TOOL_CALL", msg: "nuclei -l live.txt -severity high,critical -silent", cls: "text-[#00d4ff]" },
  { ts: "00:31.7", type: "FINDING", msg: "[critical] CVE-2024-23897 Jenkins CLI arbitrary file read → ci.example.com", cls: "text-[#ef4444]" },
  { ts: "00:32.1", type: "EVIDENCE", msg: "Response contains /etc/passwd content via CLI argument injection", cls: "text-[#f59e0b]" },
  { ts: "00:32.8", type: "HANDOFF", msg: "→ web_exploit_agent: validate and escalate CVE-2024-23897", cls: "text-[#a78bfa]" },
  { ts: "00:45.2", type: "FINDING", msg: "[high] Exposed .git directory → staging.example.com/.git/config", cls: "text-[#ef4444]" },
  { ts: "00:46.0", type: "TOOL_CALL", msg: "git-dumper https://staging.example.com/.git/ ./dump", cls: "text-[#00d4ff]" },
  { ts: "00:52.3", type: "COST", msg: "Tokens: 3,847 | Duration: 52s | Tools: 5 | Findings: 2", cls: "text-[#555]" },
];

function Terminal() {
  const [visible, setVisible] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible >= lines.length) {
      const t = setTimeout(() => setVisible(0), 3000);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setVisible((v) => v + 1), 1400);
    return () => clearTimeout(t);
  }, [visible]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [visible]);

  return (
    <div className="rounded-lg border border-white/[0.06] bg-[#0c0c12] overflow-hidden">
      <div className="flex items-center gap-1.5 px-3.5 py-2 bg-white/[0.02] border-b border-white/[0.04]">
        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 text-[11px] font-mono text-[#444]">harbinger agent-workflow — recon_agent</span>
      </div>
      <div ref={scrollRef} className="p-3 font-mono text-[11px] leading-[1.7] h-[300px] overflow-hidden">
        {lines.slice(0, visible).map((l, i) => (
          <div key={i} className="flex gap-0">
            <span className="text-[#333] w-[52px] shrink-0 select-none">{l.ts}</span>
            <span className="text-[#555] w-[100px] shrink-0">{l.type}</span>
            <span className={l.cls}>{l.msg}</span>
          </div>
        ))}
        {visible < lines.length && (
          <div className="flex gap-0">
            <span className="text-[#333] w-[52px] shrink-0 select-none">&nbsp;</span>
            <span className="inline-block w-[6px] h-[14px] bg-[#00d4ff] cursor-blink" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function HeroSection() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center">
      {/* Background */}
      <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${HERO_BG})` }} />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0a0a0f]/60 to-[#0a0a0f]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-transparent to-[#0a0a0f]/80" />

      <div className="container relative z-10 pt-20 pb-20">
        <div className="grid lg:grid-cols-[1fr,1.1fr] gap-12 lg:gap-20 items-center">
          {/* Text */}
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-white/[0.06] bg-white/[0.02] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
              <span className="font-mono text-[11px] text-[#666]">Phase 0.9 — Agent Runtime MVP</span>
            </div>

            <h1 className="font-display text-[42px] sm:text-[56px] lg:text-[64px] font-bold text-white leading-[1.05] tracking-[-0.02em]">
              Harbinger
            </h1>
            <p className="mt-2 text-[17px] sm:text-[19px] text-[#00d4ff] font-display font-medium tracking-tight">
              Local-first autonomous offensive security OS
            </p>
            <p className="mt-5 text-[15px] text-[#777] leading-[1.7] max-w-md">
              Multi-agent workflow orchestration with 150+ security tools via MCP.
              Observable, auditable, fully local. No black boxes. No cloud dependencies.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <a
                href="#about"
                onClick={(e) => { e.preventDefault(); document.querySelector("#about")?.scrollIntoView({ behavior: "smooth" }); }}
                className="px-5 py-2.5 bg-white text-[#0a0a0f] text-[13px] font-semibold rounded hover:bg-white/90 transition-colors"
              >
                Get Started
              </a>
              <a
                href="https://github.com/Haribinger/Harbinger"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium text-[#999] border border-white/[0.08] rounded hover:text-white hover:border-white/[0.15] transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                View on GitHub
              </a>
            </div>

            {/* Stats */}
            <div className="flex gap-10 mt-12 pt-8 border-t border-white/[0.04]">
              {[
                { val: "150+", label: "Security Tools" },
                { val: "100%", label: "Local-First" },
                { val: "MCP", label: "Native Protocol" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="font-display text-xl font-bold text-white">{s.val}</div>
                  <div className="text-[11px] text-[#555] mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Terminal */}
          <div className="hidden lg:block">
            <Terminal />
          </div>
        </div>
      </div>
    </section>
  );
}
