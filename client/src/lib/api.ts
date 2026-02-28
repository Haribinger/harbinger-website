import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("harbinger_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("harbinger_token");
      localStorage.removeItem("harbinger_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ── Auth ──

export async function login(email: string, password: string) {
  const { data } = await api.post("/api/auth/login", { email, password });
  localStorage.setItem("harbinger_token", data.token);
  localStorage.setItem("harbinger_user", JSON.stringify(data.user));
  return data;
}

export async function signup(email: string, password: string, name: string) {
  const { data } = await api.post("/api/auth/signup", { email, password, name });
  localStorage.setItem("harbinger_token", data.token);
  localStorage.setItem("harbinger_user", JSON.stringify(data.user));
  return data;
}

export function logout() {
  localStorage.removeItem("harbinger_token");
  localStorage.removeItem("harbinger_user");
  window.location.href = "/login";
}

export function getStoredUser() {
  const raw = localStorage.getItem("harbinger_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem("harbinger_token");
}

// ── Scans ──

export interface ScanRequest {
  target: string;
  scan_type: "recon" | "vuln_scan" | "full_audit" | "cloud_audit" | "osint";
}

export async function createScan(req: ScanRequest) {
  const { data } = await api.post("/api/scans", req);
  return data;
}

export async function cancelScan(scanId: string) {
  const { data } = await api.post(`/api/scans/${scanId}/cancel`);
  return data;
}

export async function getScan(scanId: string) {
  const { data } = await api.get(`/api/scans/${scanId}`);
  return data;
}

export async function listScans() {
  const { data } = await api.get("/api/scans");
  return data;
}

// ── Credits ──

export async function getCredits() {
  const { data } = await api.get("/api/credits");
  return data;
}

export async function purchaseCredits(packId: string) {
  const { data } = await api.post("/api/credits/purchase", { pack_id: packId });
  return data;
}

// ── Agents ──

export async function listAgents() {
  const { data } = await api.get("/api/agents");
  return data;
}

// ── Dashboard ──

export async function getDashboardStats() {
  const { data } = await api.get("/api/dashboard/stats");
  return data;
}

// ── Notifications ──

export async function listNotifications() {
  const { data } = await api.get("/api/notifications");
  return data;
}

export async function markNotificationRead(id: string) {
  const { data } = await api.post(`/api/notifications/${id}/read`);
  return data;
}

// ── Profile & Settings ──

export async function getProfile() {
  const { data } = await api.get("/api/settings/profile");
  return data;
}

export async function updateProfile(profile: { name?: string; email?: string }) {
  const { data } = await api.put("/api/settings/profile", profile);
  return data;
}

// ── API Keys ──

export async function listAPIKeys() {
  const { data } = await api.get("/api/apikeys");
  return data;
}

export async function createAPIKey(name: string, scopes: string[]) {
  const { data } = await api.post("/api/apikeys", { name, scopes });
  return data;
}

export async function revokeAPIKey(id: string) {
  const { data } = await api.delete(`/api/apikeys/${id}`);
  return data;
}

// ── Webhooks ──

export async function listWebhooks() {
  const { data } = await api.get("/api/webhooks");
  return data;
}

export async function createWebhook(url: string, events: string[]) {
  const { data } = await api.post("/api/webhooks", { url, events });
  return data;
}

export async function deleteWebhook(id: string) {
  const { data } = await api.delete(`/api/webhooks/${id}`);
  return data;
}

// ── Findings & Reports ──

export async function listFindings(scanId: string) {
  const { data } = await api.get(`/api/scans/${scanId}/findings`);
  return data;
}

export async function exportReport(scanId: string, format: "json" | "pdf" = "json") {
  const { data } = await api.get(`/api/scans/${scanId}/report`, { params: { format } });
  return data;
}

// ── Health ──

export async function healthCheck() {
  const { data } = await api.get("/api/health");
  return data;
}

export default api;
