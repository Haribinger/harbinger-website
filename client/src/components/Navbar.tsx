import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Architecture", href: "#architecture" },
  { label: "Features", href: "#features" },
  { label: "Security", href: "#security" },
  { label: "Install", href: "#quickstart" },
  { label: "Comparison", href: "#comparison" },
  { label: "Roadmap", href: "#roadmap" },
  { label: "Ecosystem", href: "#ecosystem" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (href: string) => {
    setMobileOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-200",
        scrolled
          ? "bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/[0.04]"
          : "bg-transparent"
      )}
    >
      <div className="container flex items-center justify-between h-14">
        <a
          href="#hero"
          onClick={(e) => { e.preventDefault(); go("#hero"); }}
          className="flex items-center gap-2 group"
        >
          <img
            src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663114013319/TAqStkfvjTyDDNXQ.png"
            alt="Harbinger"
            className="w-7 h-7 object-contain"
          />
          <span className="font-display font-semibold text-[15px] text-white tracking-tight">
            Harbinger
          </span>
        </a>

        <div className="hidden lg:flex items-center gap-0.5">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => { e.preventDefault(); go(l.href); }}
              className="px-3 py-1.5 text-[13px] text-[#888] hover:text-white transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/Haribinger/Harbinger"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-[#888] hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            GitHub
          </a>
          <a
            href="/docs"
            className="hidden sm:inline-flex px-3 py-1.5 text-[13px] text-[#888] hover:text-white transition-colors"
          >
            Docs
          </a>
          <a
            href="/login"
            className="hidden sm:inline-flex px-4 py-1.5 text-[13px] font-medium bg-white text-black rounded hover:bg-white/90 transition-colors"
          >
            Sign In
          </a>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-1.5 text-[#888] hover:text-white"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-[#0a0a0f]/98 backdrop-blur-md border-t border-white/[0.04] py-2">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => { e.preventDefault(); go(l.href); }}
              className="block px-6 py-2.5 text-sm text-[#888] hover:text-white transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
