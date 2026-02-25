import SectionWrapper, { SectionDesc, SectionLabel, SectionTitle } from "./SectionWrapper";
import { GitFork, Star } from "lucide-react";

const repos = [
  { name: "Nuclei", org: "projectdiscovery", stars: 27180, forks: 3193, lang: "Go", desc: "Fast, customizable vulnerability scanner powered by YAML-based DSL.", url: "https://github.com/projectdiscovery/nuclei" },
  { name: "Agent Zero", org: "agent0ai", stars: 15355, forks: 3185, lang: "Python", desc: "Agent Zero AI framework — autonomous agentic system.", url: "https://github.com/agent0ai/agent-zero" },
  { name: "Katana", org: "projectdiscovery", stars: 15596, forks: 948, lang: "Go", desc: "Next-generation crawling and spidering framework.", url: "https://github.com/projectdiscovery/katana" },
  { name: "Subfinder", org: "projectdiscovery", stars: 13130, forks: 1511, lang: "Go", desc: "Fast passive subdomain enumeration tool.", url: "https://github.com/projectdiscovery/subfinder" },
  { name: "Nuclei Templates", org: "projectdiscovery", stars: 11978, forks: 3373, lang: "YAML", desc: "Community curated vulnerability detection templates.", url: "https://github.com/projectdiscovery/nuclei-templates" },
  { name: "httpx", org: "projectdiscovery", stars: 9597, forks: 1030, lang: "Go", desc: "Fast multi-purpose HTTP toolkit with retryable probes.", url: "https://github.com/projectdiscovery/httpx" },
  { name: "PentAGI", org: "vxcontrol", stars: 7979, forks: 900, lang: "Go", desc: "Fully autonomous AI system for complex penetration testing.", url: "https://github.com/vxcontrol/pentagi" },
  { name: "HexStrike AI", org: "0x4m4", stars: 7076, forks: 1572, lang: "Python", desc: "150+ cybersecurity tools via MCP for automated pentesting.", url: "https://github.com/0x4m4/hexstrike-ai" },
  { name: "HowToHunt", org: "KathanP19", stars: 7034, forks: 1926, lang: "Markdown", desc: "Collection of methodology and test cases for web vulnerabilities.", url: "https://github.com/KathanP19/HowToHunt" },
];

function formatNum(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

export default function EcosystemSection() {
  return (
    <SectionWrapper id="ecosystem">
      <SectionLabel>Ecosystem</SectionLabel>
      <SectionTitle>Standing on the shoulders of giants.</SectionTitle>
      <SectionDesc>
        Harbinger integrates the best open-source security tools and frameworks into a unified orchestration layer.
      </SectionDesc>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px mt-14 bg-white/[0.04] rounded-lg overflow-hidden">
        {repos.map((r) => (
          <a
            key={r.name}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#0a0a0f] p-5 hover:bg-white/[0.02] transition-colors group block"
          >
            <div className="flex items-baseline gap-2 mb-1.5">
              <span className="font-display font-semibold text-white text-[14px] group-hover:text-[#00d4ff] transition-colors">{r.name}</span>
              <span className="font-mono text-[10px] text-[#444]">{r.org}</span>
            </div>
            <p className="text-[11px] text-[#666] leading-relaxed mb-3 line-clamp-2">{r.desc}</p>
            <div className="flex items-center gap-4 font-mono text-[11px] text-[#555]">
              <span className="flex items-center gap-1"><Star className="w-3 h-3" />{formatNum(r.stars)}</span>
              <span className="flex items-center gap-1"><GitFork className="w-3 h-3" />{formatNum(r.forks)}</span>
              <span className="text-[#444]">{r.lang}</span>
            </div>
          </a>
        ))}
      </div>
    </SectionWrapper>
  );
}
