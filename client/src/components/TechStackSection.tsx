import SectionWrapper, { SectionLabel, SectionTitle } from "./SectionWrapper";

const stack = [
  { name: "React", role: "Frontend UI", color: "#61dafb" },
  { name: "Go", role: "Orchestrator & Runtime", color: "#00add8" },
  { name: "Python", role: "MCP Tool Servers", color: "#3776ab" },
  { name: "Docker", role: "Tool Isolation", color: "#2496ed" },
  { name: "Neo4j", role: "Knowledge Graph", color: "#008cc1" },
  { name: "Ollama", role: "Local LLM Runtime", color: "#ffffff" },
  { name: "PostgreSQL", role: "Primary Database", color: "#4169e1" },
  { name: "Nginx", role: "Reverse Proxy & SSL", color: "#009639" },
  { name: "MCP", role: "Tool Protocol Layer", color: "#00d4ff" },
  { name: "Git", role: "Audit Trail & Memory", color: "#f05032" },
  { name: "Tailwind", role: "UI Styling", color: "#38bdf8" },
  { name: "D3.js", role: "Graph Visualization", color: "#f9a03c" },
];

export default function TechStackSection() {
  return (
    <SectionWrapper id="techstack">
      <SectionLabel>Tech Stack</SectionLabel>
      <SectionTitle>Built on proven foundations.</SectionTitle>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px mt-14 bg-white/[0.04] rounded-lg overflow-hidden">
        {stack.map((s) => (
          <div key={s.name} className="bg-[#0a0a0f] p-5 hover:bg-white/[0.015] transition-colors group">
            <div className="font-display font-semibold text-[14px] mb-1 transition-colors" style={{ color: s.color }}>{s.name}</div>
            <div className="text-[11px] text-[#555]">{s.role}</div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
