import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { docs } from "@/docs";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";
import {
  Rocket, Download, Settings, Users, Plug, Code, Key, Box,
  Shield, Monitor, GitBranch, Heart, Menu, X, ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Rocket, Download, Settings, Users, Plug, Code, Key, Box,
  Shield, Monitor, GitBranch, Heart,
};

export default function Docs() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Parse section from URL hash or query
  const hash = typeof window !== "undefined" ? window.location.hash.replace("#", "") : "";
  const [activeId, setActiveId] = useState(hash || docs[0].id);

  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash.replace("#", "");
      if (h && docs.some((d) => d.id === h)) {
        setActiveId(h);
      }
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const activeDoc = docs.find((d) => d.id === activeId) || docs[0];

  const navigate = (id: string) => {
    setActiveId(id);
    setSidebarOpen(false);
    window.history.replaceState(null, "", `/docs#${id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />

      <div className="flex pt-14">
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed bottom-4 right-4 z-50 lg:hidden w-10 h-10 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center text-[#00d4ff]"
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed lg:sticky top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-64 border-r border-white/[0.04] bg-[#0a0a0f] overflow-y-auto transition-transform duration-200 lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="p-4">
            <h2 className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#555] mb-4">Documentation</h2>
            <nav className="space-y-0.5">
              {docs.map((doc) => {
                const Icon = iconMap[doc.icon] || Code;
                const isActive = doc.id === activeId;
                return (
                  <button
                    key={doc.id}
                    onClick={() => navigate(doc.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left text-[12px] transition-colors",
                      isActive
                        ? "bg-[#00d4ff]/10 text-[#00d4ff]"
                        : "text-[#888] hover:text-white hover:bg-white/[0.03]"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    {doc.title}
                    {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 px-6 lg:px-12 py-10 max-w-4xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8 text-[11px] font-mono text-[#555]">
            <a href="/" className="hover:text-white transition-colors">Home</a>
            <span>/</span>
            <span className="text-[#888]">Docs</span>
            <span>/</span>
            <span className="text-[#00d4ff]">{activeDoc.title}</span>
          </div>

          {/* Markdown content */}
          <article className="docs-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="font-display text-[28px] font-bold text-white mb-4 pb-3 border-b border-white/[0.06]">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="font-display text-[20px] font-semibold text-white mt-10 mb-4">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="font-display text-[16px] font-semibold text-white mt-8 mb-3">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="text-[14px] text-[#999] leading-[1.8] mb-4">{children}</p>
                ),
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#00d4ff] hover:underline">{children}</a>
                ),
                code: ({ className, children }) => {
                  const isBlock = className?.includes("language-");
                  if (isBlock) {
                    return (
                      <code className="block bg-[#0c0c12] border border-white/[0.06] rounded-lg p-4 font-mono text-[11px] leading-[1.8] text-[#4ade80] overflow-x-auto mb-4 whitespace-pre">
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code className="px-1.5 py-0.5 rounded bg-white/[0.06] font-mono text-[12px] text-[#00d4ff]">{children}</code>
                  );
                },
                pre: ({ children }) => (
                  <pre className="mb-4">{children}</pre>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full text-[12px] border-collapse">{children}</table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="border-b border-white/[0.08]">{children}</thead>
                ),
                th: ({ children }) => (
                  <th className="text-left p-2.5 font-mono text-[11px] text-[#555] font-normal">{children}</th>
                ),
                td: ({ children }) => (
                  <td className="p-2.5 text-[#999] border-b border-white/[0.03]">{children}</td>
                ),
                ul: ({ children }) => (
                  <ul className="space-y-1.5 mb-4 pl-4">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="space-y-1.5 mb-4 pl-4 list-decimal">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-[13px] text-[#999] leading-[1.7]">{children}</li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-[#00d4ff]/30 pl-4 py-1 mb-4 text-[13px] text-[#777] italic">{children}</blockquote>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-white">{children}</strong>
                ),
                hr: () => <hr className="border-white/[0.06] my-8" />,
              }}
            >
              {activeDoc.content}
            </ReactMarkdown>
          </article>

          {/* Prev/Next navigation */}
          <div className="flex justify-between mt-16 pt-6 border-t border-white/[0.06]">
            {(() => {
              const idx = docs.findIndex((d) => d.id === activeId);
              const prev = idx > 0 ? docs[idx - 1] : null;
              const next = idx < docs.length - 1 ? docs[idx + 1] : null;
              return (
                <>
                  {prev ? (
                    <button onClick={() => navigate(prev.id)} className="text-left">
                      <div className="font-mono text-[10px] text-[#555] mb-1">Previous</div>
                      <div className="text-[13px] text-[#00d4ff] hover:text-white transition-colors">{prev.title}</div>
                    </button>
                  ) : <div />}
                  {next ? (
                    <button onClick={() => navigate(next.id)} className="text-right">
                      <div className="font-mono text-[10px] text-[#555] mb-1">Next</div>
                      <div className="text-[13px] text-[#00d4ff] hover:text-white transition-colors">{next.title}</div>
                    </button>
                  ) : <div />}
                </>
              );
            })()}
          </div>
        </main>
      </div>
    </div>
  );
}
