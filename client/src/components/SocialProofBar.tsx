export default function SocialProofBar() {
  const tools = [
    { name: "Nuclei", color: "#a78bfa" },
    { name: "SQLMap", color: "#ef4444" },
    { name: "Subfinder", color: "#00d4ff" },
    { name: "httpx", color: "#4ade80" },
    { name: "Prowler", color: "#f59e0b" },
    { name: "Nmap", color: "#888" },
    { name: "Nikto", color: "#00d4ff" },
    { name: "Masscan", color: "#ef4444" },
  ];

  return (
    <section className="border-y border-white/[0.03] py-6 bg-white/[0.005]">
      <div className="container">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[11px] text-[#444] font-mono shrink-0">
            Built on tools trusted by <span className="text-[#888]">100,000+</span> security professionals
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {tools.map((t) => (
              <span
                key={t.name}
                className="font-mono text-[10px] px-2.5 py-1 rounded border border-white/[0.04] text-[#555] hover:text-[#888] hover:border-white/[0.08] transition-colors"
              >
                {t.name}
              </span>
            ))}
            <span className="font-mono text-[10px] text-[#333]">+140 more</span>
          </div>
        </div>
      </div>
    </section>
  );
}
