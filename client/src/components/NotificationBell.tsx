import { useState, useRef, useEffect } from "react";
import { Bell, AlertTriangle, Shield, CheckCircle2, CreditCard, X } from "lucide-react";

interface Notification {
  id: string;
  type: "critical" | "scan" | "credit" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "n1", type: "critical", title: "Critical Finding", message: "SQL Injection detected on api.example.com", time: "2 min ago", read: false },
  { id: "n2", type: "scan", title: "Scan Complete", message: "Full audit of staging.myapp.io finished with 8 findings", time: "1 hour ago", read: false },
  { id: "n3", type: "credit", title: "Credits Low", message: "You have 12 credits remaining. Consider upgrading.", time: "3 hours ago", read: true },
  { id: "n4", type: "system", title: "New Agent Available", message: "FORGE agent v2.1 with improved exploit detection", time: "1 day ago", read: true },
];

const TYPE_CONFIG = {
  critical: { icon: <AlertTriangle className="w-3.5 h-3.5" />, color: "#ef4444" },
  scan: { icon: <Shield className="w-3.5 h-3.5" />, color: "#22c55e" },
  credit: { icon: <CreditCard className="w-3.5 h-3.5" />, color: "#f59e0b" },
  system: { icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "#00d4ff" },
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        aria-haspopup="true"
        className="relative p-1.5 text-[#888] hover:text-white transition-colors"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#ef4444] rounded-full flex items-center justify-center text-[9px] font-mono text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-[#0d0d14] border border-white/[0.06] rounded-lg shadow-xl shadow-black/40 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04]">
            <span className="text-[13px] font-medium text-white">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-[11px] text-[#00d4ff] hover:text-[#00d4ff]/80 transition-colors">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-[12px] text-[#444]">No notifications</div>
            ) : (
              notifications.map((n) => {
                const cfg = TYPE_CONFIG[n.type];
                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors ${
                      !n.read ? "bg-white/[0.01]" : ""
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: `${cfg.color}15`, color: cfg.color }}
                    >
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] text-white font-medium">{n.title}</span>
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff]" />}
                      </div>
                      <p className="text-[11px] text-[#666] mt-0.5 line-clamp-2">{n.message}</p>
                      <span className="text-[10px] text-[#444] mt-1 block">{n.time}</span>
                    </div>
                    <button
                      onClick={() => dismiss(n.id)}
                      className="p-0.5 text-[#333] hover:text-[#888] transition-colors shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <div className="px-4 py-2 border-t border-white/[0.04]">
            <a href="/settings" className="text-[11px] text-[#555] hover:text-[#888] transition-colors">
              Notification settings
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
