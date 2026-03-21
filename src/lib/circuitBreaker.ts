/**
 * In-memory Circuit Breaker.
 *
 * States:
 *   CLOSED  → normal operation, requests pass through.
 *   OPEN    → too many failures, requests are rejected immediately.
 *   HALF    → after cooldown, one probe request is allowed.
 *
 * Usage:
 *   const cb = getCircuitBreaker("tiktok:createAd");
 *   if (!cb.allowRequest()) throw new Error("Circuit open — service unavailable");
 *   try {
 *     const result = await doWork();
 *     cb.recordSuccess();
 *     return result;
 *   } catch (e) {
 *     cb.recordFailure();
 *     throw e;
 *   }
 */

type CBState = "CLOSED" | "OPEN" | "HALF";

interface CBOptions {
  /** Consecutive failures needed to open the circuit. Default: 3 */
  failureThreshold?: number;
  /** Milliseconds to wait in OPEN state before moving to HALF. Default: 30_000 */
  cooldownMs?: number;
}

interface CBEntry {
  state: CBState;
  failures: number;
  openedAt: number;
  options: Required<CBOptions>;
}

const registry = new Map<string, CBEntry>();

function getOrCreate(key: string, options?: CBOptions): CBEntry {
  if (!registry.has(key)) {
    registry.set(key, {
      state: "CLOSED",
      failures: 0,
      openedAt: 0,
      options: {
        failureThreshold: options?.failureThreshold ?? 3,
        cooldownMs: options?.cooldownMs ?? 30_000,
      },
    });
  }
  return registry.get(key)!;
}

export interface CircuitBreaker {
  /** Returns true if the request is allowed to proceed. */
  allowRequest(): boolean;
  /** Call after a successful operation. */
  recordSuccess(): void;
  /** Call after a failed operation. */
  recordFailure(): void;
  /** Current state for observability. */
  state(): CBState;
  /** Reset to CLOSED (for tests or manual recovery). */
  reset(): void;
}

export function getCircuitBreaker(key: string, options?: CBOptions): CircuitBreaker {
  const entry = getOrCreate(key, options);

  return {
    allowRequest(): boolean {
      const now = Date.now();
      if (entry.state === "CLOSED") return true;
      if (entry.state === "OPEN") {
        if (now - entry.openedAt >= entry.options.cooldownMs) {
          entry.state = "HALF";
          return true; // probe request
        }
        return false;
      }
      // HALF: allow one probe
      return true;
    },

    recordSuccess(): void {
      entry.failures = 0;
      entry.state = "CLOSED";
    },

    recordFailure(): void {
      entry.failures++;
      if (entry.failures >= entry.options.failureThreshold || entry.state === "HALF") {
        entry.state = "OPEN";
        entry.openedAt = Date.now();
        console.warn(`[CircuitBreaker:${key}] OPENED after ${entry.failures} failure(s). Cooldown: ${entry.options.cooldownMs / 1000}s`);
      }
    },

    state(): CBState {
      return entry.state;
    },

    reset(): void {
      entry.state = "CLOSED";
      entry.failures = 0;
      entry.openedAt = 0;
    },
  };
}
