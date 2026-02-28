import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  User,
  Key,
  Bell,
  Shield,
  Palette,
  Copy,
  Check,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Globe,
  Webhook,
} from "lucide-react";

// ── Types ──

interface APIKey {
  id: string;
  name: string;
  prefix: string;
  created: string;
  lastUsed: string;
  scopes: string[];
}

interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  lastTriggered?: string;
}

type SettingsTab = "profile" | "api-keys" | "notifications" | "security" | "webhooks" | "appearance";

// ── Mock Data ──

const MOCK_KEYS: APIKey[] = [
  { id: "key-1", name: "Production", prefix: "hbr_live_a8f2", created: "Jan 15, 2026", lastUsed: "2 hours ago", scopes: ["scans:write", "findings:read"] },
  { id: "key-2", name: "CI/CD Pipeline", prefix: "hbr_live_c3d1", created: "Feb 10, 2026", lastUsed: "1 day ago", scopes: ["scans:write", "scans:read"] },
  { id: "key-3", name: "Development", prefix: "hbr_test_x9k4", created: "Feb 20, 2026", lastUsed: "Never", scopes: ["scans:read", "findings:read"] },
];

const MOCK_WEBHOOKS: WebhookConfig[] = [
  { id: "wh-1", url: "https://hooks.slack.com/services/T00/B00/xxx", events: ["scan.completed", "finding.critical"], active: true, lastTriggered: "2 hours ago" },
  { id: "wh-2", url: "https://api.pagerduty.com/incidents", events: ["finding.critical"], active: true, lastTriggered: "3 days ago" },
];

const TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
  { id: "api-keys", label: "API Keys", icon: <Key className="w-4 h-4" /> },
  { id: "webhooks", label: "Webhooks", icon: <Webhook className="w-4 h-4" /> },
  { id: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
  { id: "security", label: "Security", icon: <Shield className="w-4 h-4" /> },
  { id: "appearance", label: "Appearance", icon: <Palette className="w-4 h-4" /> },
];

// ── Components ──

function ProfileTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-[15px] font-medium text-white mb-4">Profile Information</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="profile-name" className="block text-[12px] text-[#888] mb-1.5">Display Name</label>
            <input
              id="profile-name"
              type="text"
              defaultValue="Operator"
              autoComplete="name"
              className="w-full bg-[#111118] border border-white/[0.06] rounded-lg px-3 py-2 text-[13px] text-white placeholder-[#444] focus:border-[#00d4ff]/30 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label htmlFor="profile-email" className="block text-[12px] text-[#888] mb-1.5">Email</label>
            <input
              id="profile-email"
              type="email"
              defaultValue="admin@harbinger.ai"
              autoComplete="email"
              className="w-full bg-[#111118] border border-white/[0.06] rounded-lg px-3 py-2 text-[13px] text-white placeholder-[#444] focus:border-[#00d4ff]/30 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label htmlFor="profile-org" className="block text-[12px] text-[#888] mb-1.5">Organization</label>
            <input
              id="profile-org"
              type="text"
              defaultValue="Harbinger Security"
              autoComplete="organization"
              className="w-full bg-[#111118] border border-white/[0.06] rounded-lg px-3 py-2 text-[13px] text-white placeholder-[#444] focus:border-[#00d4ff]/30 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-[15px] font-medium text-white mb-4">Plan</h3>
        <div className="flex items-center justify-between p-4 bg-[#111118] border border-white/[0.06] rounded-lg">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-white font-medium">Free Plan</span>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-[#00d4ff]/10 text-[#00d4ff] rounded">ACTIVE</span>
            </div>
            <p className="text-[11px] text-[#555] mt-1">50 credits/month · 5 scans/day · Community support</p>
          </div>
          <a href="/pricing" className="flex items-center gap-1 px-3 py-1.5 bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded text-[12px] text-[#00d4ff] hover:bg-[#00d4ff]/20 transition-colors">
            Upgrade <ChevronRight className="w-3 h-3" />
          </a>
        </div>
      </div>

      <button className="px-4 py-2 bg-white text-black rounded-lg text-[13px] font-medium hover:bg-white/90 transition-colors">
        Save Changes
      </button>
    </div>
  );
}

function APIKeysTab() {
  const [copied, setCopied] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  const copyKey = (prefix: string) => {
    navigator.clipboard.writeText(`${prefix}••••••••••••••••`);
    setCopied(prefix);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-medium text-white">API Keys</h3>
          <p className="text-[11px] text-[#555] mt-1">Manage keys for programmatic access to the Harbinger API</p>
        </div>
        <button
          onClick={() => setShowNew(!showNew)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-lg text-[12px] text-[#00d4ff] hover:bg-[#00d4ff]/20 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Create Key
        </button>
      </div>

      {showNew && (
        <div className="p-4 bg-[#111118] border border-[#00d4ff]/20 rounded-lg space-y-3">
          <div>
            <label htmlFor="new-key-name" className="block text-[12px] text-[#888] mb-1.5">Key Name</label>
            <input
              id="new-key-name"
              type="text"
              placeholder="e.g. Production, CI/CD"
              className="w-full bg-[#0a0a0f] border border-white/[0.06] rounded px-3 py-2 text-[13px] text-white placeholder-[#444] focus:border-[#00d4ff]/30 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-[12px] text-[#888] mb-1.5">Scopes</label>
            <div className="flex flex-wrap gap-2">
              {["scans:read", "scans:write", "findings:read", "findings:write", "credits:read"].map((scope) => (
                <label key={scope} className="flex items-center gap-1.5 px-2 py-1 bg-white/[0.03] border border-white/[0.06] rounded text-[11px] text-[#888] cursor-pointer hover:border-white/[0.12] transition-colors">
                  <input type="checkbox" className="rounded border-[#333] bg-transparent" />
                  {scope}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-[#00d4ff] text-black rounded text-[12px] font-medium hover:bg-[#00d4ff]/90 transition-colors">
              Generate Key
            </button>
            <button onClick={() => setShowNew(false)} className="px-3 py-1.5 text-[12px] text-[#555] hover:text-white transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {MOCK_KEYS.map((key) => (
          <div key={key.id} className="p-4 bg-[#111118] border border-white/[0.04] rounded-lg hover:border-white/[0.08] transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Key className="w-3.5 h-3.5 text-[#f59e0b]" />
                <span className="text-[13px] text-white font-medium">{key.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyKey(key.prefix)}
                  className="p-1 text-[#555] hover:text-white transition-colors"
                  aria-label={copied === key.prefix ? "Copied!" : `Copy API key ${key.name}`}
                >
                  {copied === key.prefix ? <Check className="w-3.5 h-3.5 text-[#22c55e]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button className="p-1 text-[#555] hover:text-[#ef4444] transition-colors" aria-label={`Revoke API key ${key.name}`}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <code className="text-[12px] font-mono text-[#666] bg-white/[0.03] px-2 py-0.5 rounded">{key.prefix}••••••••</code>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-[#555]">
              <span>Created: {key.created}</span>
              <span>Last used: {key.lastUsed}</span>
              <span>Scopes: {key.scopes.join(", ")}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WebhooksTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-medium text-white">Webhooks</h3>
          <p className="text-[11px] text-[#555] mt-1">Get notified when events happen in your Harbinger account</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-lg text-[12px] text-[#00d4ff] hover:bg-[#00d4ff]/20 transition-colors">
          <Plus className="w-3.5 h-3.5" />
          Add Webhook
        </button>
      </div>

      <div className="space-y-2">
        {MOCK_WEBHOOKS.map((wh) => (
          <div key={wh.id} className="p-4 bg-[#111118] border border-white/[0.04] rounded-lg hover:border-white/[0.08] transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-[#8b5cf6]" />
                <code className="text-[12px] font-mono text-[#888] truncate max-w-xs">{wh.url}</code>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${wh.active ? "bg-[#22c55e]" : "bg-[#555]"}`} />
                <span className="text-[11px] text-[#555]">{wh.active ? "Active" : "Disabled"}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {wh.events.map((e) => (
                <span key={e} className="px-1.5 py-0.5 text-[10px] font-mono bg-white/[0.04] text-[#888] rounded">{e}</span>
              ))}
            </div>
            {wh.lastTriggered && (
              <p className="text-[10px] text-[#444] mt-2">Last triggered: {wh.lastTriggered}</p>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 bg-[#111118] border border-white/[0.04] rounded-lg">
        <h4 className="text-[12px] font-medium text-[#888] mb-2">Available Events</h4>
        <div className="grid grid-cols-2 gap-1">
          {["scan.started", "scan.completed", "scan.failed", "finding.critical", "finding.high", "credits.low", "report.ready"].map((evt) => (
            <span key={evt} className="text-[11px] font-mono text-[#555] py-0.5">{evt}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotificationsTab() {
  const channels = [
    { label: "Critical findings", email: true, push: true, slack: false },
    { label: "Scan completed", email: true, push: false, slack: true },
    { label: "Credit alerts", email: true, push: false, slack: false },
    { label: "Weekly digest", email: true, push: false, slack: false },
    { label: "New features", email: false, push: false, slack: false },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-[15px] font-medium text-white">Notification Preferences</h3>
      <div className="bg-[#111118] border border-white/[0.04] rounded-lg overflow-hidden">
        <div className="grid grid-cols-4 gap-4 px-4 py-2 border-b border-white/[0.04]">
          <span className="text-[11px] text-[#555]">Event</span>
          <span className="text-[11px] text-[#555] text-center">Email</span>
          <span className="text-[11px] text-[#555] text-center">Push</span>
          <span className="text-[11px] text-[#555] text-center">Slack</span>
        </div>
        {channels.map((ch) => (
          <div key={ch.label} className="grid grid-cols-4 gap-4 px-4 py-3 border-b border-white/[0.02] last:border-0">
            <span className="text-[12px] text-[#888]">{ch.label}</span>
            {(["email", "push", "slack"] as const).map((type) => (
              <div key={type} className="flex justify-center">
                <label className="relative inline-flex cursor-pointer">
                  <input type="checkbox" defaultChecked={ch[type]} className="sr-only peer" />
                  <div className="w-8 h-4 bg-[#222] rounded-full peer peer-checked:bg-[#00d4ff]/30 peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-[#555] after:peer-checked:bg-[#00d4ff] after:rounded-full after:h-3 after:w-3 after:transition-all" />
                </label>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function SecurityTab() {
  return (
    <div className="space-y-6">
      <h3 className="text-[15px] font-medium text-white">Security Settings</h3>

      <div className="space-y-4">
        <div className="p-4 bg-[#111118] border border-white/[0.04] rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] text-white font-medium">Password</span>
            <button className="text-[12px] text-[#00d4ff] hover:text-[#00d4ff]/80 transition-colors">
              Change password
            </button>
          </div>
          <p className="text-[11px] text-[#555]">Last changed 30 days ago</p>
        </div>

        <div className="p-4 bg-[#111118] border border-white/[0.04] rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] text-white font-medium">Two-Factor Authentication</span>
            <button className="px-3 py-1 bg-[#22c55e]/10 border border-[#22c55e]/20 rounded text-[12px] text-[#22c55e]">
              Enable
            </button>
          </div>
          <p className="text-[11px] text-[#555]">Add an extra layer of security with TOTP-based 2FA</p>
        </div>

        <div className="p-4 bg-[#111118] border border-white/[0.04] rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] text-white font-medium">Active Sessions</span>
            <button className="text-[12px] text-[#ef4444] hover:text-[#ef4444]/80 transition-colors">
              Revoke all
            </button>
          </div>
          <div className="space-y-2 mt-3">
            {[
              { device: "Chrome on Linux", ip: "192.168.1.x", current: true },
              { device: "CLI Tool", ip: "10.0.0.x", current: false },
            ].map((s) => (
              <div key={s.device} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-[#888]">{s.device}</span>
                  {s.current && (
                    <span className="px-1.5 py-0.5 text-[9px] font-mono bg-[#22c55e]/10 text-[#22c55e] rounded">CURRENT</span>
                  )}
                </div>
                <span className="text-[11px] font-mono text-[#444]">{s.ip}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-[#111118] border border-white/[0.04] rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] text-white font-medium">IP Allowlist</span>
            <button className="text-[12px] text-[#00d4ff] hover:text-[#00d4ff]/80 transition-colors">
              Configure
            </button>
          </div>
          <p className="text-[11px] text-[#555]">Restrict API access to specific IP addresses</p>
        </div>
      </div>
    </div>
  );
}

function AppearanceTab() {
  return (
    <div className="space-y-6">
      <h3 className="text-[15px] font-medium text-white">Appearance</h3>

      <div>
        <label className="block text-[12px] text-[#888] mb-3">Theme</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: "Dark", bg: "#0a0a0f", border: "#00d4ff", active: true },
            { name: "Midnight", bg: "#0f0f1a", border: "#333", active: false },
            { name: "OLED", bg: "#000000", border: "#333", active: false },
          ].map((t) => (
            <button
              key={t.name}
              className={`p-4 rounded-lg border-2 transition-colors ${
                t.active ? "border-[#00d4ff]" : "border-white/[0.04] hover:border-white/[0.08]"
              }`}
              style={{ backgroundColor: t.bg }}
            >
              <div className="w-full h-8 rounded bg-white/[0.03] mb-2" />
              <span className="text-[11px] text-[#888]">{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[12px] text-[#888] mb-3">Accent Color</label>
        <div className="flex gap-2">
          {["#00d4ff", "#8b5cf6", "#22c55e", "#f59e0b", "#ef4444", "#ec4899"].map((c) => (
            <button
              key={c}
              className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                c === "#00d4ff" ? "border-white" : "border-transparent"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[12px] text-[#888] mb-3">Font Size</label>
        <div className="flex items-center gap-3">
          <input type="range" min="12" max="16" defaultValue="14" className="flex-1 accent-[#00d4ff]" />
          <span className="text-[12px] font-mono text-[#555]">14px</span>
        </div>
      </div>
    </div>
  );
}

// ── Main ──

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  const tabContent: Record<SettingsTab, React.ReactNode> = {
    profile: <ProfileTab />,
    "api-keys": <APIKeysTab />,
    webhooks: <WebhooksTab />,
    notifications: <NotificationsTab />,
    security: <SecurityTab />,
    appearance: <AppearanceTab />,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="container max-w-5xl mx-auto px-4">
          <h1 className="text-xl font-semibold text-white mb-6">Settings</h1>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="lg:w-48 shrink-0">
              <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? "bg-white/[0.05] text-white"
                        : "text-[#666] hover:text-[#888] hover:bg-white/[0.02]"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">{tabContent[activeTab]}</div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
