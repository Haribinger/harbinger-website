export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const HARBINGER_LOGO = "/logo.png";
export const GITHUB_REPO_URL = "https://github.com/Harbinger-AI/harbinger";
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
