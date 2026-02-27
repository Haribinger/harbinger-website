import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function StickyCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (dismissed) return;
      setVisible(window.scrollY > 800);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed]);

  if (dismissed || !visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c0c16]/95 backdrop-blur-md border-t border-[#00d4ff]/10 py-2.5 animate-in slide-in-from-bottom-4 duration-300">
      <div className="container flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-pulse" />
          <span className="text-[12px] text-[#888] hidden sm:inline">
            <span className="text-white font-medium">Harbinger Cloud</span> — Managed swarm, zero setup, team collaboration.
          </span>
          <span className="text-[12px] text-[#888] sm:hidden">
            <span className="text-white font-medium">Harbinger Cloud</span> is coming.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/pricing"
            className="px-3.5 py-1.5 rounded bg-[#00d4ff] text-[#0a0a0f] text-[11px] font-semibold hover:bg-[#00d4ff]/90 transition-colors"
          >
            View Pricing
          </a>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-[#444] hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
