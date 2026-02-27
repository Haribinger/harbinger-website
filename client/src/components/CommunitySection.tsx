import SectionWrapper, { SectionDesc, SectionLabel, SectionTitle } from "./SectionWrapper";

const pluginTypes = [
  { type: "Tool Plugin", desc: "Add new MCP tool servers — wrap any CLI tool, API, or scanner.", example: "nuclei-custom, burp-mcp" },
  { type: "Agent Runtime", desc: "Create new agent types with specialized reasoning and capabilities.", example: "mobile-agent, iot-agent" },
  { type: "Channel Plugin", desc: "Add new control surfaces — Slack, Matrix, custom webhooks.", example: "slack-channel, matrix-bot" },
  { type: "Workflow Template", desc: "Pre-built pentest playbooks and recon pipelines.", example: "full-recon, api-audit" },
  { type: "Report Template", desc: "Custom output formats for findings and evidence.", example: "pdf-pentest, jira-export" },
];

export default function CommunitySection() {
  return (
    <SectionWrapper id="community">
      <SectionLabel>Plugins & Community</SectionLabel>
      <SectionTitle>Extend everything.</SectionTitle>
      <SectionDesc>
        Drop-in plugin architecture. Add tools, agents, channels, workflows, and report templates without modifying core code.
      </SectionDesc>

      <div className="mt-14 rounded-lg border border-white/[0.06] overflow-hidden">
        <div className="grid divide-y divide-white/[0.04]">
          {pluginTypes.map((p) => (
            <div key={p.type} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 p-4 hover:bg-white/[0.015] transition-colors">
              <div className="font-display font-semibold text-white text-[13px] sm:w-40 shrink-0">{p.type}</div>
              <div className="text-[12px] text-[#666] flex-1">{p.desc}</div>
              <div className="font-mono text-[10px] text-[#444] shrink-0">{p.example}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 p-5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
        <div className="font-mono text-[11px] text-[#555] mb-2">Plugin directory structure</div>
        <pre className="font-mono text-[11px] text-[#666] leading-relaxed">{`/plugins/
  /agents/      ← Custom agent runtimes
  /tools/       ← MCP tool servers
  /channels/    ← Control surface adapters
  /workflows/   ← Pre-built workflow templates
  /reports/     ← Output format templates`}</pre>
      </div>

      {/* MCP Registry Discovery */}
      <div className="mt-8 rounded-xl border border-[#4ade80]/15 bg-gradient-to-r from-[#4ade80]/[0.03] to-transparent p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-20 h-px bg-gradient-to-r from-[#4ade80]/50 to-transparent" />
        <div className="absolute top-0 left-0 w-px h-20 bg-gradient-to-b from-[#4ade80]/50 to-transparent" />
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-lg border border-[#4ade80]/20 bg-[#4ade80]/10 flex items-center justify-center">
              <svg width="20" height="20" fill="none" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            </div>
            <div>
              <div className="font-display font-semibold text-white text-[14px]">MCP Registry Discovery</div>
              <div className="font-mono text-[10px] text-[#4ade80]/70">5,800+ servers &middot; 300+ clients &middot; Open standard</div>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-[12px] text-[#777] leading-relaxed">
              Harbinger's 4 MCP servers are discoverable in the GitHub MCP Registry. Control your agent swarm from any MCP-compatible client — Claude Desktop, Cursor, Windsurf, or your own tools.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            {["Claude", "Cursor", "Windsurf", "Any MCP Client"].map((c) => (
              <span key={c} className="font-mono text-[10px] px-2.5 py-1 rounded-full border border-white/[0.06] bg-white/[0.02] text-[#888]">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
