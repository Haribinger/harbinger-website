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
    </SectionWrapper>
  );
}
