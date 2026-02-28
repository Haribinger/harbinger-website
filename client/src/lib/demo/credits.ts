/**
 * Credits module — thin wrapper around the real backend credits API.
 * Falls back to localStorage when the backend is not reachable (e.g. demo/preview mode).
 */
import { useCallback, useEffect, useState } from "react";
import { getCredits as apiGetCredits } from "@/lib/api";

const STORAGE_KEY = "harbinger_demo_credits";
const MAX_CREDITS = 10;

interface StoredCredits {
  remaining: number;
  lastResetDate: string;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadLocalCredits(): StoredCredits {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: StoredCredits = JSON.parse(raw);
      if (parsed.lastResetDate === todayStr()) {
        return parsed;
      }
    }
  } catch {
    // corrupted storage — reset
  }
  const fresh: StoredCredits = { remaining: MAX_CREDITS, lastResetDate: todayStr() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  return fresh;
}

function saveLocalCredits(credits: StoredCredits): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(credits));
}

export function useCredits() {
  const [remaining, setRemaining] = useState<number>(() => loadLocalCredits().remaining);
  const [max] = useState<number>(MAX_CREDITS);
  const [backendAvailable, setBackendAvailable] = useState(false);

  // Try to load real credits from backend
  useEffect(() => {
    apiGetCredits()
      .then((data: { remaining?: number; balance?: number }) => {
        const val = data.remaining ?? data.balance ?? remaining;
        setRemaining(val);
        setBackendAvailable(true);
      })
      .catch(() => {
        // Backend not reachable — fall back to localStorage
        setBackendAvailable(false);
        const local = loadLocalCredits();
        setRemaining(local.remaining);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Periodically poll backend for credit balance when it is available
  useEffect(() => {
    if (!backendAvailable) return;
    const interval = setInterval(() => {
      apiGetCredits()
        .then((data: { remaining?: number; balance?: number }) => {
          const val = data.remaining ?? data.balance ?? remaining;
          setRemaining(val);
        })
        .catch(() => {});
    }, 30_000);
    return () => clearInterval(interval);
  }, [backendAvailable, remaining]);

  // Day-reset check for localStorage fallback
  useEffect(() => {
    if (backendAvailable) return;
    const check = () => {
      const today = todayStr();
      setRemaining((prev) => {
        const stored = loadLocalCredits();
        if (stored.lastResetDate !== today) {
          const fresh = { remaining: MAX_CREDITS, lastResetDate: today };
          saveLocalCredits(fresh);
          return MAX_CREDITS;
        }
        return prev;
      });
    };
    check();
    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, [backendAvailable]);

  /**
   * Attempt to spend credits. Returns true if successful.
   * When backend is available, actual deduction happens server-side on scan creation.
   * When offline, deducts from localStorage.
   */
  const spend = useCallback(
    (cost: number): boolean => {
      if (remaining < cost) return false;
      if (!backendAvailable) {
        // Deduct locally only in offline/fallback mode
        const current = loadLocalCredits();
        if (current.remaining < cost) return false;
        const updated = { ...current, remaining: current.remaining - cost };
        saveLocalCredits(updated);
        setRemaining(updated.remaining);
      }
      // When backend is available, the scan API call already deducts credits server-side
      return true;
    },
    [remaining, backendAvailable]
  );

  const canAfford = useCallback(
    (cost: number) => remaining >= cost,
    [remaining]
  );

  return {
    remaining,
    max,
    spend,
    canAfford,
    backendAvailable,
  };
}
