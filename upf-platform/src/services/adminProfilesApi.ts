import { apiFetch, apiJson } from "./apiClient";

/** Réponses API (camelCase ou PascalCase selon config serveur) */
function pickId(obj: Record<string, unknown>, ...keys: string[]): number | undefined {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "number" && !Number.isNaN(v)) return v;
  }
  return undefined;
}

function pickStr(obj: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string") return v;
  }
  return undefined;
}

export type FiliereRow = { id: number; code: string; nom: string };
export type NiveauRow = { id: number; nom: string; idFiliere: number };

export async function fetchFilieres(): Promise<FiliereRow[]> {
  const raw = await apiJson<unknown>("/api/Filiere/GetAllFiliere", { skipAuth: true });
  if (!Array.isArray(raw)) return [];
  return raw.map((r) => ({
    id: pickId(r as Record<string, unknown>, "idFiliere", "IdFiliere") ?? 0,
    code: pickStr(r as Record<string, unknown>, "code", "Code") ?? "",
    nom: pickStr(r as Record<string, unknown>, "nom", "Nom") ?? "",
  }));
}

export async function fetchNiveaux(): Promise<NiveauRow[]> {
  const raw = await apiJson<unknown>("/api/NiveauScolaire/GetAllNiveau", { skipAuth: true });
  if (!Array.isArray(raw)) return [];
  return raw.map((r) => ({
    id: pickId(r as Record<string, unknown>, "idNiveauScolaire", "IdNiveauScolaire") ?? 0,
    nom: pickStr(r as Record<string, unknown>, "nom", "Nom") ?? "",
    idFiliere:
      pickId(r as Record<string, unknown>, "idFiliere_fk_NiveauScol", "IdFiliere_fk_NiveauScol", "idFiliereFkNiveauScol") ??
      0,
  }));
}

export async function createEtudiant(body: {
  nom: string;
  prenom: string;
  email: string;
  matricule: string;
  idFiliere: number;
  idNiveauScolaire?: number;
}): Promise<void> {
  const res = await apiFetch("/api/Etudiant/CreateEtudiant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nom: body.nom.trim(),
      prenom: body.prenom.trim(),
      email: body.email.trim(),
      matricule: body.matricule.trim(),
      idFiliere: body.idFiliere,
      idNiveauScolaire: body.idNiveauScolaire ?? null,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
}

export async function createEnseignant(body: {
  nom: string;
  prenom: string;
  email: string;
  matricule: string;
}): Promise<void> {
  const res = await apiFetch("/api/Enseignant/CreateEnseignant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nom: body.nom.trim(),
      prenom: body.prenom.trim(),
      email: body.email.trim(),
      matricule: body.matricule.trim(),
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
}

export async function createAdministrateur(body: {
  nom: string;
  prenom: string;
  email: string;
}): Promise<void> {
  const res = await apiFetch("/api/Administrateur/CreateAdministrateur", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nom: body.nom.trim(),
      prenom: body.prenom.trim(),
      email: body.email.trim(),
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
}
