import { useState } from "react";
import SectionWrapper, { SectionLabel, SectionTitle } from "./SectionWrapper";

export default function CloudWaitlistSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <SectionWrapper id="cloud-waitlist">
      <div className="max-w-2xl mx-auto text-center">
        <SectionLabel>Harbinger Cloud</SectionLabel>
        <SectionTitle className="text-center">
          Your swarm. Fully managed.
        </SectionTitle>
        <p className="mt-4 text-[15px] text-[#777] leading-relaxed">
          Zero infrastructure. Team collaboration. Automatic updates. All the power of Harbinger
          with none of the setup. Be the first to know when Harbinger Cloud launches.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 items-center justify-center">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-md">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[13px] text-white placeholder:text-[#444] focus:outline-none focus:border-[#00d4ff]/30 focus:ring-1 focus:ring-[#00d4ff]/20 transition-colors"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-[#00d4ff] text-[#0a0a0f] text-[13px] font-semibold hover:bg-[#00d4ff]/90 transition-colors shrink-0"
              >
                Join Waitlist
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#4ade80]/20 bg-[#4ade80]/[0.04]">
              <div className="w-2 h-2 rounded-full bg-[#4ade80]" />
              <span className="text-[13px] text-[#4ade80]">You're on the list. We'll be in touch.</span>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[11px] text-[#444] font-mono">
          <span>Zero setup</span>
          <span className="text-[#333]">/</span>
          <span>Team workspaces</span>
          <span className="text-[#333]">/</span>
          <span>99.9% uptime SLA</span>
          <span className="text-[#333]">/</span>
          <span>Starting at $29/mo</span>
        </div>

        {/* Comparison pill */}
        <div className="mt-8 inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/[0.04] bg-white/[0.01]">
          <span className="font-mono text-[10px] text-[#ef4444]">NodeZero: $5k-$120k/yr</span>
          <span className="text-[#333]">vs</span>
          <span className="font-mono text-[10px] text-[#4ade80]">Harbinger Cloud: $29/mo</span>
        </div>
      </div>
    </SectionWrapper>
  );
}
