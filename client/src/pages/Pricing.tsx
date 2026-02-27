import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, X, ArrowRight, Shield, Zap, Building2 } from "lucide-react";
import { useState } from "react";

const tiers = [
  {
    name: "Community",
    tagline: "Self-hosted, full-featured, open-source.",
    price: "Free",
    priceNote: "forever",
    cta: "Get Started",
    ctaHref: "#quickstart",
    ctaStyle: "border border-white/[0.08] text-white hover:bg-white/[0.04]",
    icon: Shield,
    color: "#4ade80",
    popular: false,
    features: [
      { text: "11 autonomous agents", included: true },
      { text: "150+ security tools via MCP", included: true },
      { text: "Visual workflow editor", included: true },
      { text: "Neo4j knowledge graph", included: true },
      { text: "Full observability dashboard", included: true },
      { text: "Docker isolation", included: true },
      { text: "Autonomous Intelligence (60s loops)", included: true },
      { text: "Unlimited workflows", included: true },
      { text: "Community support (GitHub)", included: true },
      { text: "Team collaboration", included: false },
      { text: "Compliance reports (PCI, NIS2)", included: false },
      { text: "Priority support & SLA", included: false },
    ],
  },
  {
    name: "Cloud",
    tagline: "Managed swarm. Zero infrastructure. Team collaboration.",
    price: "$29",
    priceNote: "/month",
    priceYearly: "$23",
    cta: "Join Waitlist",
    ctaHref: "#cloud-waitlist",
    ctaStyle: "bg-[#00d4ff] text-[#0a0a0f] font-semibold hover:bg-[#00d4ff]/90",
    icon: Zap,
    color: "#00d4ff",
    popular: true,
    features: [
      { text: "Everything in Community", included: true },
      { text: "Managed hosting (zero setup)", included: true },
      { text: "Team workspaces (up to 5 users)", included: true },
      { text: "Shared findings & projects", included: true },
      { text: "Cloud-synced knowledge graph", included: true },
      { text: "Priority email support", included: true },
      { text: "Premium agents (Code Agent)", included: true },
      { text: "Automatic updates", included: true },
      { text: "99.9% uptime SLA", included: true },
      { text: "SSO (SAML/OIDC)", included: false },
      { text: "Compliance reports (PCI, NIS2)", included: false },
      { text: "Dedicated account manager", included: false },
    ],
  },
  {
    name: "Enterprise",
    tagline: "On-prem, SSO, compliance, dedicated support.",
    price: "Custom",
    priceNote: "contact sales",
    cta: "Contact Sales",
    ctaHref: "/enterprise",
    ctaStyle: "border border-white/[0.08] text-white hover:bg-white/[0.04]",
    icon: Building2,
    color: "#a78bfa",
    popular: false,
    features: [
      { text: "Everything in Cloud", included: true },
      { text: "Unlimited users & teams", included: true },
      { text: "SSO (SAML/OIDC)", included: true },
      { text: "Compliance reports (PCI, NIS2, SOC2)", included: true },
      { text: "On-premises deployment option", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "Custom SLA guarantees", included: true },
      { text: "White-labeling for MSSPs", included: true },
      { text: "SIEM/SOAR integration", included: true },
      { text: "Audit logs & role-based access", included: true },
      { text: "Custom agent development", included: true },
      { text: "Training & onboarding", included: true },
    ],
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />
      <div className="container pt-28 pb-20">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="font-mono text-[11px] tracking-[0.15em] uppercase text-[#00d4ff] mb-4">Pricing</div>
          <h1 className="font-display text-3xl md:text-[42px] font-bold text-white leading-tight tracking-tight">
            Free forever. Pro when you need it.
          </h1>
          <p className="mt-4 text-[15px] text-[#777] leading-relaxed">
            The full open-source platform is free. Harbinger Cloud adds managed hosting, team collaboration, and enterprise features.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className={`text-[13px] transition-colors ${!yearly ? "text-white" : "text-[#555]"}`}>Monthly</span>
            <button
              onClick={() => setYearly(!yearly)}
              className="relative w-11 h-6 rounded-full bg-white/[0.08] border border-white/[0.06] transition-colors"
            >
              <div
                className="absolute top-0.5 w-5 h-5 rounded-full bg-[#00d4ff] transition-transform duration-200"
                style={{ transform: yearly ? "translateX(22px)" : "translateX(2px)" }}
              />
            </button>
            <span className={`text-[13px] transition-colors ${yearly ? "text-white" : "text-[#555]"}`}>
              Yearly
              <span className="ml-1.5 font-mono text-[10px] text-[#4ade80]">Save 20%</span>
            </span>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tiers.map((tier) => {
            const displayPrice = yearly && tier.priceYearly ? tier.priceYearly : tier.price;
            return (
              <div
                key={tier.name}
                className={`relative rounded-xl border p-6 transition-all ${
                  tier.popular
                    ? "border-[#00d4ff]/30 bg-gradient-to-b from-[#00d4ff]/[0.04] to-transparent"
                    : "border-white/[0.06] bg-white/[0.01]"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="font-mono text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border border-[#00d4ff]/30 bg-[#00d4ff]/10 text-[#00d4ff]">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Corner accents for popular */}
                {tier.popular && (
                  <>
                    <div className="absolute top-0 left-0 w-16 h-px bg-gradient-to-r from-[#00d4ff]/50 to-transparent" />
                    <div className="absolute top-0 left-0 w-px h-16 bg-gradient-to-b from-[#00d4ff]/50 to-transparent" />
                    <div className="absolute top-0 right-0 w-16 h-px bg-gradient-to-l from-[#00d4ff]/50 to-transparent" />
                    <div className="absolute top-0 right-0 w-px h-16 bg-gradient-to-b from-[#00d4ff]/50 to-transparent" />
                  </>
                )}

                <div className="mb-6">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div
                      className="w-8 h-8 rounded-lg border flex items-center justify-center"
                      style={{ borderColor: `${tier.color}20`, backgroundColor: `${tier.color}08` }}
                    >
                      <tier.icon className="w-4 h-4" style={{ color: tier.color }} />
                    </div>
                    <h3 className="font-display font-semibold text-white text-[18px]">{tier.name}</h3>
                  </div>
                  <p className="text-[12px] text-[#666] leading-relaxed">{tier.tagline}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-[36px] font-bold text-white">{displayPrice}</span>
                    <span className="font-mono text-[12px] text-[#555]">{tier.priceNote}</span>
                  </div>
                </div>

                <a
                  href={tier.ctaHref}
                  className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-[13px] font-medium transition-all ${tier.ctaStyle}`}
                >
                  {tier.cta}
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>

                <div className="mt-6 pt-6 border-t border-white/[0.04] space-y-3">
                  {tier.features.map((f) => (
                    <div key={f.text} className="flex items-start gap-2.5 text-[12px]">
                      {f.included ? (
                        <Check className="w-3.5 h-3.5 text-[#4ade80] shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-[#333] shrink-0 mt-0.5" />
                      )}
                      <span className={f.included ? "text-[#999]" : "text-[#444]"}>{f.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* NodeZero comparison callout */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="rounded-xl border border-[#ef4444]/15 bg-gradient-to-r from-[#ef4444]/[0.03] to-transparent p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-20 h-px bg-gradient-to-r from-[#ef4444]/40 to-transparent" />
            <div className="absolute top-0 left-0 w-px h-20 bg-gradient-to-b from-[#ef4444]/40 to-transparent" />
            <div className="text-center">
              <div className="font-mono text-[10px] text-[#ef4444]/70 uppercase tracking-wider mb-2">The alternative</div>
              <h3 className="font-display font-bold text-white text-[18px] mb-3">
                Why pay $120k/year for a black-box pentesting platform?
              </h3>
              <p className="text-[13px] text-[#777] leading-relaxed max-w-xl mx-auto mb-4">
                NodeZero's enterprise plan costs $119,940/year for 1,500 assets. Harbinger gives you more features — multi-agent
                orchestration, visual workflows, autonomous intelligence, 150+ tools — completely free and open source.
              </p>
              <div className="flex items-center justify-center gap-6 text-[12px]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
                  <span className="text-[#888]">NodeZero: <span className="text-[#ef4444] font-semibold">$5k–$120k/yr</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#4ade80]" />
                  <span className="text-[#888]">Harbinger: <span className="text-[#4ade80] font-semibold">Free</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-white text-center mb-10">Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "Is the open-source version limited?",
                a: "No. The Community edition includes all 11 agents, 150+ tools, the visual workflow editor, autonomous intelligence, and the full dashboard. It's the same codebase we use ourselves.",
              },
              {
                q: "What does Harbinger Cloud add?",
                a: "Cloud adds managed hosting (zero Docker setup), team workspaces, shared findings, automatic updates, and priority support. Think of it as convenience — the core platform is identical.",
              },
              {
                q: "Can I switch from Cloud to self-hosted?",
                a: "Yes. Your data is yours. Export everything and run it locally anytime. No vendor lock-in, ever.",
              },
              {
                q: "Do you offer discounts for startups or students?",
                a: "Yes. Reach out to us for startup and academic pricing. We also offer free Cloud access for open-source security research.",
              },
            ].map((faq) => (
              <div key={faq.q} className="rounded-lg border border-white/[0.04] bg-white/[0.01] p-5">
                <h3 className="font-display font-semibold text-white text-[14px] mb-2">{faq.q}</h3>
                <p className="text-[12px] text-[#777] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
