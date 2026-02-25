export default function Footer() {
  return (
    <footer className="border-t border-white/[0.04] py-16">
      <div className="container">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center">
                <span className="font-display font-bold text-[#00d4ff] text-[10px]">H</span>
              </div>
              <span className="font-display font-semibold text-white text-[14px]">Harbinger</span>
            </div>
            <p className="text-[12px] text-[#555] leading-relaxed">
              Local-first autonomous offensive security OS. Built for the security community.
            </p>
          </div>
          <div>
            <h4 className="font-mono text-[11px] text-[#555] uppercase tracking-wider mb-4">Product</h4>
            <div className="space-y-2">
              {["Features", "Architecture", "Roadmap", "Tech Stack"].map((l) => (
                <a key={l} href={`#${l.toLowerCase().replace(" ", "")}`} className="block text-[12px] text-[#666] hover:text-white transition-colors">{l}</a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-mono text-[11px] text-[#555] uppercase tracking-wider mb-4">Community</h4>
            <div className="space-y-2">
              <a href="https://github.com/Haribinger/Harbinger" target="_blank" rel="noopener noreferrer" className="block text-[12px] text-[#666] hover:text-white transition-colors">GitHub</a>
              <a href="#community" className="block text-[12px] text-[#666] hover:text-white transition-colors">Plugin SDK</a>
              <a href="#ecosystem" className="block text-[12px] text-[#666] hover:text-white transition-colors">Ecosystem</a>
            </div>
          </div>
          <div>
            <h4 className="font-mono text-[11px] text-[#555] uppercase tracking-wider mb-4">Resources</h4>
            <div className="space-y-2">
              <span className="block text-[12px] text-[#444]">Documentation (coming soon)</span>
              <span className="block text-[12px] text-[#444]">API Reference (coming soon)</span>
              <span className="block text-[12px] text-[#444]">Blog (coming soon)</span>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-[11px] text-[#444]">Built for the security community. Open source.</div>
          <div className="text-[11px] text-[#333]">© 2025 Harbinger Project</div>
        </div>
      </div>
    </footer>
  );
}
