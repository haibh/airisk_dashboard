/**
 * Login Attempt Tracker
 *
 * Tracks failed login attempts per email and enforces lockout
 * after MAX_ATTEMPTS consecutive failures within WINDOW_MS.
 * Uses in-memory Map (no Redis dependency to avoid client bundle issues).
 * On Vercel serverless, each cold start resets — acceptable tradeoff
 * since Vercel's bot detection provides supplementary brute-force protection.
 */

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes
const WINDOW_MS = 10 * 60 * 1000; // 10-minute window

interface AttemptRecord {
  count: number;
  firstAttemptAt: number;
  lockedUntil: number | null;
}

const store = new Map<string, AttemptRecord>();

// Periodic cleanup to prevent memory leak
let lastCleanup = Date.now();
function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < 60_000) return; // cleanup at most once/min
  lastCleanup = now;
  for (const [key, rec] of store) {
    const expired = rec.lockedUntil
      ? now > rec.lockedUntil
      : now - rec.firstAttemptAt > WINDOW_MS;
    if (expired) store.delete(key);
  }
}

/**
 * Record a failed login attempt. Returns remaining attempts before lockout.
 */
export async function recordFailedAttempt(email: string): Promise<number> {
  cleanup();
  const key = email.toLowerCase();
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || (now - existing.firstAttemptAt > WINDOW_MS && !existing.lockedUntil)) {
    store.set(key, { count: 1, firstAttemptAt: now, lockedUntil: null });
    return MAX_ATTEMPTS - 1;
  }

  existing.count += 1;
  if (existing.count >= MAX_ATTEMPTS) {
    existing.lockedUntil = now + LOCKOUT_MS;
  }
  return Math.max(0, MAX_ATTEMPTS - existing.count);
}

/**
 * Check if an account is currently locked out.
 */
export async function isAccountLocked(email: string): Promise<{ locked: boolean; remainingSeconds: number }> {
  cleanup();
  const key = email.toLowerCase();
  const rec = store.get(key);

  if (!rec || !rec.lockedUntil) {
    return { locked: false, remainingSeconds: 0 };
  }

  const now = Date.now();
  if (now > rec.lockedUntil) {
    store.delete(key);
    return { locked: false, remainingSeconds: 0 };
  }

  return { locked: true, remainingSeconds: Math.ceil((rec.lockedUntil - now) / 1000) };
}

/**
 * Clear failed attempts on successful login.
 */
export async function clearFailedAttempts(email: string): Promise<void> {
  store.delete(email.toLowerCase());
}
