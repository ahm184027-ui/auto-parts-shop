import { nanoid } from "nanoid";

export const ADMIN_SESSION_COOKIE = "admin_sid";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const sessions = new Map<string, number>();

export function createAdminSession(): string {
  const token = nanoid(32);
  sessions.set(token, Date.now() + SESSION_TTL_MS);
  return token;
}

export function isValidAdminSession(token: string | undefined): boolean {
  if (!token) return false;
  const expiresAt = sessions.get(token);
  if (!expiresAt) return false;
  if (expiresAt < Date.now()) {
    sessions.delete(token);
    return false;
  }
  return true;
}

export function revokeAdminSession(token: string | undefined): void {
  if (token) sessions.delete(token);
}
