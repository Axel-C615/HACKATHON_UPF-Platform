import type { UserType } from "../types";

/**
 * En dev, sans VITE_API_BASE_URL : chaîne vide → requêtes relatives `/api/...` via le proxy Vite.
 * Avec VITE_API_BASE_URL : appel direct (ex. http://localhost:5292).
 * En build prod sans env : repli localhost (tests locaux du dist).
 */
export function getApiBase(): string {
  const v = import.meta.env.VITE_API_BASE_URL;
  if (typeof v === "string" && v.trim() !== "") return v.replace(/\/$/, "");
  if (import.meta.env.DEV) return "";
  return "http://localhost:5292";
}

/** @deprecated Utiliser getApiBase() — conservé pour compatibilité */
export const API_BASE = getApiBase();

const LOGIN_BY_ROLE: Record<UserType, string> = {
  etudiant: "/api/Etudiant/login",
  prof: "/api/Enseignant/login",
  admin: "/api/Administrateur/login",
  administration: "/api/Administrateur/login",
};

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  firstname: string;
  role: string;
  /** URL absolue ou data URL (image profil), synchronisé après édition profil */
  photoUrl?: string;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export async function loginRequest(
  role: UserType,
  email: string,
  password: string
): Promise<LoginResponse> {
  const path = LOGIN_BY_ROLE[role];
  const res = await fetch(`${getApiBase()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email: email.trim(), password }),
  });

  if (res.ok) {
    return (await res.json()) as LoginResponse;
  }

  if (res.status === 401) {
    throw new Error("unauthorized");
  }

  const text = await res.text();
  throw new Error(text || `HTTP ${res.status}`);
}

/** Ordre des tentatives : même email peut exister dans une seule table — le premier succès gagne. */
const AUTO_LOGIN_ROLES: UserType[] = ["etudiant", "prof", "admin"];

/**
 * Connexion sans choix de profil : essaie successivement les endpoints étudiant, enseignant, administrateur.
 * Les comptes admin partagent l’API `Administrateur/login` ; côté UI on positionne `administration` (menu complet).
 */
export async function loginRequestAuto(
  email: string,
  password: string
): Promise<{ response: LoginResponse; userType: UserType }> {
  let lastError: Error = new Error("unauthorized");

  for (const role of AUTO_LOGIN_ROLES) {
    try {
      const response = await loginRequest(role, email, password);
      const userType: UserType = role === "admin" ? "administration" : role;
      return { response, userType };
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      lastError = err;
      const msg = err.message.toLowerCase();
      const isUnauthorized =
        err.message === "unauthorized" ||
        msg.includes("401") ||
        msg.includes("invalid credentials") ||
        msg.includes("unauthorized");
      if (!isUnauthorized) throw err;
    }
  }

  throw lastError;
}

export const SESSION_TOKEN_KEY = "upf_token";
export const SESSION_USER_KEY = "upf_user";

export function saveAuthSession(data: LoginResponse): void {
  localStorage.setItem(SESSION_TOKEN_KEY, data.token);
  localStorage.setItem(SESSION_USER_KEY, JSON.stringify(data.user));
}

export const SESSION_ROLE_KEY = "upf_user_type";

/** Prénom + nom (ordre d’affichage FR), repli sur email. */
export function formatAuthDisplayName(u: AuthUser | null | undefined): string {
  if (!u) return "—";
  const fn = (u.firstname ?? "").trim();
  const nm = (u.name ?? "").trim();
  if (fn && nm) return `${fn} ${nm}`;
  return fn || nm || u.email || "—";
}

export function authUserInitials(u: AuthUser | null | undefined): string {
  if (!u) return "?";
  const f = (u.firstname ?? "").trim();
  const n = (u.name ?? "").trim();
  const e = (u.email ?? "").trim();
  if (f && n) return `${f[0]}${n[0]}`.toUpperCase();
  const single = f || n;
  if (single.length >= 2) return `${single[0]}${single[1]}`.toUpperCase();
  if (single.length === 1) return single[0]!.toUpperCase();
  if (e.length >= 2) return `${e[0]}${e[1]}`.toUpperCase();
  return (e[0] || "?").toUpperCase();
}

export function getStoredAuthUser(): AuthUser | null {
  try {
    const s = localStorage.getItem(SESSION_USER_KEY);
    if (!s) return null;
    const o = JSON.parse(s) as Partial<AuthUser>;
    if (typeof o.id !== "number" || typeof o.email !== "string") return null;
    return {
      id: o.id,
      email: o.email,
      name: o.name ?? "",
      firstname: o.firstname ?? "",
      role: o.role ?? "",
      photoUrl: typeof o.photoUrl === "string" ? o.photoUrl : undefined,
    };
  } catch {
    return null;
  }
}

export function clearAuthSession(): void {
  localStorage.removeItem(SESSION_TOKEN_KEY);
  localStorage.removeItem(SESSION_USER_KEY);
  localStorage.removeItem(SESSION_ROLE_KEY);
}

export function getStoredToken(): string | null {
  return localStorage.getItem(SESSION_TOKEN_KEY);
}
