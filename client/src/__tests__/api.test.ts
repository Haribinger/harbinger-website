import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getStoredUser,
  isAuthenticated,
  logout,
} from "../lib/api";

describe("api utilities", () => {
  beforeEach(() => {
    localStorage.clear();
    // Mock window.location for logout
    Object.defineProperty(window, "location", {
      writable: true,
      value: { href: "" },
    });
  });

  describe("getStoredUser", () => {
    it("returns null when no user stored", () => {
      expect(getStoredUser()).toBeNull();
    });

    it("returns parsed user from localStorage", () => {
      const user = { id: "u1", email: "test@test.com" };
      localStorage.setItem("harbinger_user", JSON.stringify(user));
      expect(getStoredUser()).toEqual(user);
    });

    it("returns null for invalid JSON", () => {
      localStorage.setItem("harbinger_user", "not-json{");
      expect(getStoredUser()).toBeNull();
    });
  });

  describe("isAuthenticated", () => {
    it("returns false when no token", () => {
      expect(isAuthenticated()).toBe(false);
    });

    it("returns true when token exists", () => {
      localStorage.setItem("harbinger_token", "some-jwt");
      expect(isAuthenticated()).toBe(true);
    });
  });

  describe("logout", () => {
    it("clears token and user from localStorage", () => {
      localStorage.setItem("harbinger_token", "jwt");
      localStorage.setItem("harbinger_user", "{}");
      logout();
      expect(localStorage.getItem("harbinger_token")).toBeNull();
      expect(localStorage.getItem("harbinger_user")).toBeNull();
    });

    it("redirects to /login", () => {
      logout();
      expect(window.location.href).toBe("/login");
    });
  });
});
