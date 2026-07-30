const BOOKING_API = process.env.NEXT_PUBLIC_BOOKING_API_URL ?? "http://localhost:5011";
const TOKEN_KEY = "tt_token";

export type UserProfile = { id: string; email: string; fullName: string; createdAtUtc: string };
export type AuthResult = { token: string; expiresAtUtc: string; user: UserProfile };

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function authHeader(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function extractError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (Array.isArray(body.errors)) return body.errors.join(", ");
    if (body.errors) return String(body.errors);
    return res.statusText;
  } catch {
    return res.statusText;
  }
}

export async function register(email: string, password: string, fullName: string): Promise<AuthResult> {
  const res = await fetch(`${BOOKING_API}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, fullName }),
  });
  if (!res.ok) throw new Error(await extractError(res));
  const data: AuthResult = await res.json();
  setToken(data.token);
  return data;
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const res = await fetch(`${BOOKING_API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await extractError(res));
  const data: AuthResult = await res.json();
  setToken(data.token);
  return data;
}

export async function fetchProfile(): Promise<UserProfile> {
  const res = await fetch(`${BOOKING_API}/api/profile`, { headers: authHeader(), cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load profile");
  return res.json();
}

export async function updateProfile(fullName: string, phoneNumber: string | null): Promise<UserProfile> {
  const res = await fetch(`${BOOKING_API}/api/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ fullName, phoneNumber }),
  });
  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}
