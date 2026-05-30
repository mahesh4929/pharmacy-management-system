import { AuthSession, UserRole } from "./types";

const SESSION_KEY = "scm_session";

// Decode JWT payload without external lib
function decodeJWT(token: string): any {
  try {
    const payload = token.split(".")[1];
    const padded = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), "=");
    const decoded = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function saveSession(token: string): AuthSession | null {
  const payload = decodeJWT(token);
  if (!payload) return null;

  // Backend embeds username, id, sub (role), and admin in JWT
  const sub = payload.sub as string; // "customer" or "employee"
  const username = payload.username as string;
  const userId = payload.id as number;
  const isAdmin = payload.admin === true;

  let role: UserRole = "customer";
  if (sub === "employee") {
    role = isAdmin ? "admin" : "employee";
  }

  const session: AuthSession = { token, username, userId, role };
  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  return session;
}

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function isLoggedIn(): boolean {
  return getSession() !== null;
}

export function getRole(): UserRole | null {
  return getSession()?.role || null;
}
