import crypto from "crypto";

export function decodeJwtPayload<T = unknown>(jwt?: string): T | null {
  if (!jwt) return null;
  const parts = jwt.split(".");
  if (parts.length < 2) return null;
  const payloadB64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  try {
    const padded = payloadB64 + "===".slice((payloadB64.length + 3) % 4);
    const json =
      typeof window !== "undefined"
        ? decodeURIComponent(escape(window.atob(padded)))
        : Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function isValidEmailFormat(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, "tamdan_auth_salt", 1000, 64, "sha512").toString("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  const hashedPassword = hashPassword(password);
  return hashedPassword === hash;
}

export function createJwtToken(payload: Record<string, unknown>): string {
  const header = { alg: "HS256", typ: "JWT" };
  const encodeB64Url = (obj: Record<string, unknown>) =>
    Buffer.from(JSON.stringify(obj))
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

  const headerB64 = encodeB64Url(header);
  const payloadB64 = encodeB64Url(payload);
  const signature = encodeB64Url({ sig: "tamdan_auth_signature" });

  return `${headerB64}.${payloadB64}.${signature}`;
}
