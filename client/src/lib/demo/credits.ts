import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "harbinger_demo_credits";
const MAX_CREDITS = 10;

interface StoredCredits {
  remaining: number;
  lastResetDate: string;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadCredits(): StoredCredits {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: StoredCredits = JSON.parse(raw);
      if (parsed.lastResetDate === todayStr()) {
        return parsed;
      }
    }
  } catch {
    // corrupted, reset
  }
  const fresh: StoredCredits = { remaining: MAX_CREDITS, lastResetDate: todayStr() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  return fresh;
}

function saveCredits(credits: StoredCredits): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(credits));
}

export function useCredits() {
  const [credits, setCredits] = useState<StoredCredits>(loadCredits);

  // Check for day reset on mount and periodically
  useEffect(() => {
    const check = () => {
      const today = todayStr();
      setCredits((prev) => {
        if (prev.lastResetDate !== today) {
          const fresh = { remaining: MAX_CREDITS, lastResetDate: today };
          saveCredits(fresh);
          return fresh;
        }
        return prev;
      });
    };
    check();
    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, []);

  const spend = useCallback((cost: number): boolean => {
    const current = loadCredits();
    if (current.remaining < cost) return false;
    const updated = { ...current, remaining: current.remaining - cost };
    saveCredits(updated);
    setCredits(updated);
    return true;
  }, []);

  const canAfford = useCallback(
    (cost: number) => credits.remaining >= cost,
    [credits.remaining]
  );

  return {
    remaining: credits.remaining,
    max: MAX_CREDITS,
    spend,
    canAfford,
  };
}
