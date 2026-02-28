export default function Footer() {
  return (
    <footer className="border-t border-white/[0.04] py-16">
      <div className="container">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663114013319/TAqStkfvjTyDDNXQ.png"
                alt="Harbinger"
                className="w-6 h-6 object-contain"
                loading="lazy"
                decoding="async"
              />
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
              <a href="/docs" className="block text-[12px] text-[#666] hover:text-white transition-colors">Documentation</a>
              <a href="/docs#api-reference" className="block text-[12px] text-[#666] hover:text-white transition-colors">API Reference</a>
              <a href="/status" className="block text-[12px] text-[#666] hover:text-white transition-colors">System Status</a>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-[11px] text-[#444]">Built for the security community. Open source.</div>
          <div className="text-[11px] text-[#333]">© 2025–2026 Harbinger Project</div>
        </div>
      </div>
    </footer>
  );
}
