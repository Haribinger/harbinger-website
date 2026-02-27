import SectionWrapper, { SectionDesc, SectionLabel, SectionTitle } from "./SectionWrapper";

const personas = [
  {
    role: "Penetration Testers",
    hook: "Build custom exploit chains visually. Save templates. Automate the boring parts.",
    detail: "Visual workflow editor with drag-drop pentests, 6 node types, parallel branches, and reusable templates. PATHFINDER recons, BREACH exploits, SCRIBE reports — all orchestrated.",
    color: "#00d4ff",
    icon: "crosshair",
    features: ["Visual exploit chains", "Template library", "Auto-reporting"],
  },
  {
    role: "Enterprise Security Teams",
    hook: "Run pentests on your terms — no cloud, no data leaks, full control. Save $120k/year.",
    detail: "100% local-first with Docker isolation, Neo4j knowledge graph, and compliance-ready reporting. Your data never leaves your network. Matches NodeZero at zero cost.",
    color: "#a78bfa",
    icon: "shield",
    features: ["Local-first privacy", "Compliance reports", "Full audit trail"],
    badge: "Cloud / Enterprise",
  },
  {
    role: "Bug Bounty Hunters",
    hook: "Automate recon and scanning with your own agent swarm. 150+ tools, zero noise.",
    detail: "PATHFINDER enumerates subdomains, BREACH probes for vulnerabilities, SPECTER gathers OSINT — all running in parallel while you sleep. Wake up to prioritized findings.",
    color: "#f59e0b",
    icon: "target",
    features: ["Parallel recon", "Priority findings", "Cost tracking"],
  },
  {
    role: "DevSecOps",
    hook: "Integrate autonomous security into your CI/CD pipeline. Catch vulnerabilities before deployment.",
    detail: "Webhook triggers from GitHub, Cron scheduling, and API-driven workflows. Run security checks on every push, merge, or deploy. Get findings in Slack or JIRA.",
    color: "#4ade80",
    icon: "pipeline",
    features: ["CI/CD integration", "Webhook triggers", "API-first"],
    badge: "Cloud / Enterprise",
  },
  {
    role: "MSSPs & Security Firms",
    hook: "White-label Harbinger for your clients. Add your own tools, workflows, and branding.",
    detail: "Multi-tenant workspaces, custom branding, role-based access, and team collaboration. Scale your offensive security practice with managed agent fleets.",
    color: "#ef4444",
    icon: "building",
    features: ["White-labeling", "Multi-tenancy", "Partner portal"],
    badge: "Enterprise",
  },
];

function PersonaIcon({ type, color }: { type: string; color: string }) {
  const props = { width: 22, height: 22, fill: "none", stroke: color, strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (type) {
    case "crosshair": return <svg {...props} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M22 12h-4M6 12H2M12 6V2M12 22v-4" /><circle cx="12" cy="12" r="3" /></svg>;
    case "shield": return <svg {...props} viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>;
    case "target": return <svg {...props} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" fill={color} /><path d="M12 3v4M12 17v4" /></svg>;
    case "pipeline": return <svg {...props} viewBox="0 0 24 24"><path d="M4 4h6v6H4zM14 4h6v6h-6zM9 14h6v6H9z" /><path d="M7 10v2a2 2 0 002 2M17 10v2a2 2 0 01-2 2" /></svg>;
    case "building": return <svg {...props} viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" /></svg>;
    default: return null;
  }
}

export default function UseCasesSection() {
  return (
    <SectionWrapper id="usecases">
      <SectionLabel>Use Cases</SectionLabel>
      <SectionTitle>Built for every security role.</SectionTitle>
      <SectionDesc>
        Whether you're a solo researcher or an enterprise team, Harbinger adapts to your workflow.
      </SectionDesc>

      <div className="mt-14 space-y-3">
        {personas.map((p) => (
          <div
            key={p.role}
            className="group rounded-xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.02] transition-all duration-300 p-6 relative overflow-hidden"
          >
            {/* Hover glow */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: `radial-gradient(ellipse at 0% 50%, ${p.color}06 0%, transparent 50%)` }}
            />

            <div className="relative flex flex-col sm:flex-row gap-5">
              <div className="flex items-start gap-4 sm:w-64 shrink-0">
                <div
                  className="w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 group-hover:border-opacity-30 transition-colors"
                  style={{ borderColor: `${p.color}15`, backgroundColor: `${p.color}06` }}
                >
                  <PersonaIcon type={p.icon} color={p.color} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-semibold text-white text-[14px] group-hover:text-[#00d4ff] transition-colors">{p.role}</h3>
                    {"badge" in p && p.badge && (
                      <span className="font-mono text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-[#a78bfa]/20 bg-[#a78bfa]/10 text-[#a78bfa]">
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    {p.features.map((f) => (
                      <span key={f} className="font-mono text-[9px] px-2 py-0.5 rounded border border-white/[0.06] text-[#555]">{f}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <p className="text-[13px] text-white/90 font-medium leading-relaxed mb-1.5" style={{ color: p.color }}>
                  {p.hook}
                </p>
                <p className="text-[12px] text-[#666] leading-relaxed">{p.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
