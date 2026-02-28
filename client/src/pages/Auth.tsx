import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import { Github, Key, Smartphone, ArrowRight, Loader2, Copy, Check, ExternalLink } from "lucide-react";
import { HARBINGER_LOGO } from "@/const";

type Tab = "oauth" | "device" | "token";

// Harbinger API base — configurable via env var, defaults to local dev
const API_BASE = import.meta.env.VITE_HARBINGER_API || "http://localhost:3000";

export default function Auth() {
  const [tab, setTab] = useState<Tab>("oauth");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Device flow state
  const [device, setDevice] = useState<{
    userCode: string;
    verificationUri: string;
    deviceCode: string;
    interval: number;
  } | null>(null);
  const [polling, setPolling] = useState(false);
  const [copied, setCopied] = useState(false);

  // Token state
  const [tokenInput, setTokenInput] = useState("");

  // Check if already authenticated (token in URL from callback)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      // Redirect to main app with token
      window.location.href = `${API_BASE}/login?token=${token}`;
    }
  }, []);

  // ── OAuth ──────────────────────────────────────────────────────────────────

  const handleOAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/github`);
      const data = await res.json();
      if (data.ok && data.auth_url) {
        window.location.href = data.auth_url;
      } else {
        setError(data.error || data.reason || "Failed to initiate OAuth — is GITHUB_CLIENT_ID configured?");
      }
    } catch {
      setError("Cannot reach Harbinger API. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  // ── Device Flow ────────────────────────────────────────────────────────────

  const handleDeviceStart = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/github/device/start`, { method: "POST" });
      const data = await res.json();
      if (data.ok !== false && data.user_code) {
        setDevice({
          userCode: data.user_code,
          verificationUri: data.verification_uri,
          deviceCode: data.device_code,
          interval: data.interval || 5,
        });
        startPolling(data.device_code, data.interval || 5);
      } else {
        setError(data.error || "Failed to start device flow");
      }
    } catch {
      setError("Cannot reach Harbinger API");
    } finally {
      setLoading(false);
    }
  };

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clear polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current !== null) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const startPolling = (deviceCode: string, interval: number) => {
    setPolling(true);
    // Clear any existing interval before starting a new one
    if (pollIntervalRef.current !== null) {
      clearInterval(pollIntervalRef.current);
    }
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/github/device/poll`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ device_code: deviceCode }),
        });
        const data = await res.json();
        if (data.token) {
          if (pollIntervalRef.current !== null) clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
          setPolling(false);
          // Redirect to main app with token
          window.location.href = `${API_BASE}/login?token=${data.token}`;
        } else if (data.error === "expired") {
          if (pollIntervalRef.current !== null) clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
          setPolling(false);
          setDevice(null);
          setError("Device code expired. Try again.");
        }
      } catch {
        // Keep polling
      }
    }, interval * 1000);
  };

  // ── Token Auth ─────────────────────────────────────────────────────────────

  const handleToken = async () => {
    if (!tokenInput.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/github/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenInput.trim() }),
      });
      const data = await res.json();
      if (data.token) {
        window.location.href = `${API_BASE}/login?token=${data.token}`;
      } else {
        setError(data.error || "Invalid token");
      }
    } catch {
      setError("Cannot reach Harbinger API");
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: typeof Github }[] = [
    { id: "oauth", label: "GitHub", icon: Github },
    { id: "device", label: "Device Flow", icon: Smartphone },
    { id: "token", label: "Token", icon: Key },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />

      <div className="container pt-24 pb-20 flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <img
              src={HARBINGER_LOGO}
              alt="Harbinger"
              className="w-12 h-12 mx-auto mb-4"
            />
            <h1 className="font-display text-[24px] font-bold text-white">Sign in to Harbinger</h1>
            <p className="text-[13px] text-[#666] mt-2">
              Authenticate with GitHub to access your Harbinger command center.
            </p>
          </div>

          {/* Tab selector */}
          <div role="tablist" aria-label="Authentication method" className="flex gap-1 p-1 rounded-lg bg-white/[0.03] border border-white/[0.06] mb-6">
            {tabs.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                aria-controls={`tabpanel-${t.id}`}
                id={`tab-${t.id}`}
                onClick={() => { setTab(t.id); setError(null); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[12px] font-medium transition-colors ${
                  tab === t.id
                    ? "bg-white/[0.08] text-white"
                    : "text-[#666] hover:text-[#999]"
                }`}
              >
                <t.icon className="w-3.5 h-3.5" aria-hidden="true" />
                {t.label}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20 text-[12px] text-[#ef4444]">
              {error}
            </div>
          )}

          {/* Tab content */}
          <div
            role="tabpanel"
            id={`tabpanel-${tab}`}
            aria-labelledby={`tab-${tab}`}
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-6"
          >
            {tab === "oauth" && (
              <div className="space-y-4">
                <p className="text-[12px] text-[#666] leading-relaxed">
                  Standard GitHub OAuth flow. Redirects to GitHub, then back to your Harbinger instance.
                </p>
                <button
                  onClick={handleOAuth}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white text-[#0a0a0f] text-[13px] font-semibold hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4" />}
                  Continue with GitHub
                </button>
              </div>
            )}

            {tab === "device" && (
              <div className="space-y-4">
                {!device ? (
                  <>
                    <p className="text-[12px] text-[#666] leading-relaxed">
                      No callback URL needed. Best for Docker, Windows IIS, or environments where redirect-based OAuth doesn't work.
                    </p>
                    <button
                      onClick={handleDeviceStart}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20 text-[13px] font-semibold hover:bg-[#00d4ff]/20 transition-colors disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
                      Start Device Flow
                    </button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-[11px] text-[#666] mb-2">Enter this code at GitHub:</p>
                      <div className="flex items-center justify-center gap-2">
                        <code className="text-[24px] font-mono font-bold text-[#00d4ff] tracking-[0.2em]">
                          {device.userCode}
                        </code>
                        <button
                          onClick={() => { navigator.clipboard.writeText(device.userCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                          className="p-1.5 rounded bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                          aria-label={copied ? "Copied!" : "Copy code to clipboard"}
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-[#4ade80]" /> : <Copy className="w-3.5 h-3.5 text-[#555]" />}
                        </button>
                      </div>
                    </div>
                    <a
                      href={device.verificationUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white text-[#0a0a0f] text-[13px] font-semibold hover:bg-white/90 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open GitHub Verification
                    </a>
                    {polling && (
                      <div className="flex items-center justify-center gap-2 text-[11px] text-[#666]">
                        <Loader2 className="w-3 h-3 animate-spin text-[#00d4ff]" />
                        Waiting for authorization...
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {tab === "token" && (
              <div className="space-y-4">
                <p className="text-[12px] text-[#666] leading-relaxed">
                  Paste a GitHub Personal Access Token. Create one at{" "}
                  <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-[#00d4ff] hover:underline">
                    github.com/settings/tokens
                  </a>
                </p>
                <input
                  id="token-input"
                  type="password"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="ghp_..."
                  aria-label="GitHub Personal Access Token"
                  className="w-full px-3 py-2.5 rounded-lg bg-[#0c0c12] border border-white/[0.08] text-[13px] font-mono text-white placeholder-[#444] focus:outline-none focus:border-[#00d4ff]/30 transition-colors"
                  onKeyDown={(e) => e.key === "Enter" && handleToken()}
                />
                <button
                  onClick={handleToken}
                  disabled={loading || !tokenInput.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20 text-[13px] font-semibold hover:bg-[#00d4ff]/20 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  Sign in with Token
                </button>
              </div>
            )}
          </div>

          {/* API connection info */}
          <div className="mt-6 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center gap-2 text-[11px] font-mono text-[#555]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
              Connecting to: <span className="text-[#888]">{API_BASE}</span>
            </div>
          </div>

          <p className="text-center text-[11px] text-[#444] mt-6">
            Don't have an instance?{" "}
            <a href="/docs#installation" className="text-[#00d4ff] hover:underline">Install Harbinger</a>
          </p>
        </div>
      </div>
    </div>
  );
}
