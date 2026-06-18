import type { AbsenceDataRow, CoursData, CoursItem, Emploi, EmploiCours, Etudiant } from "../types";
import { ANNEES, MATIERES } from "../data/constants";
import { apiFetch, apiJson } from "./apiClient";

// ─── Helpers JSON (PascalCase / camelCase) ───────────────────────────────────
export function pickNum(o: Record<string, unknown>, ...keys: string[]): number | undefined {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "number" && !Number.isNaN(v)) return v;
  }
  return undefined;
}

export function pickStr(o: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string") return v;
  }
  return undefined;
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

// ─── Étudiants ───────────────────────────────────────────────────────────────
export async function fetchAllEtudiantsRaw(): Promise<Record<string, unknown>[]> {
  const raw = await apiJson<unknown>("/api/Etudiant/GetAllEtudiant", { skipAuth: true });
  return Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [];
}

export function mapApiStudentToEtudiant(r: Record<string, unknown>): Etudiant {
  const idNum = pickNum(r, "idUtilisateur", "IdUtilisateur") ?? 0;
  const niveauNom = pickStr(
    asRecord(r.niveauScolaire ?? r.NiveauScolaire) ?? {},
    "nom",
    "Nom"
  );
  const annee = niveauNom && ANNEES.includes(niveauNom) ? niveauNom : "2GI";
  return {
    id: `ET${idNum}`,
    nom: `${pickStr(r, "prenom", "Prenom") ?? ""} ${pickStr(r, "nom", "Nom") ?? ""}`.trim(),
    annee,
    email: pickStr(r, "email", "Email") ?? "",
    statut: "Actif",
    paiement: "Partiel",
    paye: 0,
    total: 28000,
  };
}

export async function fetchEtudiantRaw(id: number): Promise<Record<string, unknown>> {
  return apiJson<Record<string, unknown>>(`/api/Etudiant/GetEtudiantById/${id}`, { skipAuth: true });
}

export async function putEtudiant(id: number, body: Record<string, unknown>): Promise<void> {
  const res = await apiFetch(`/api/Etudiant/UpdateEtudiant/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function fetchEnseignantRaw(id: number): Promise<Record<string, unknown>> {
  return apiJson<Record<string, unknown>>(`/api/Enseignant/GetEnseignantById/${id}`, { skipAuth: true });
}

export async function putEnseignant(id: number, body: Record<string, unknown>): Promise<void> {
  const res = await apiFetch(`/api/Enseignant/UpdateEnseignant/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function fetchAdministrateurRaw(id: number): Promise<Record<string, unknown>> {
  return apiJson<Record<string, unknown>>(`/api/Administrateur/GetAdministrateurById/${id}`, { skipAuth: true });
}

export async function putAdministrateur(id: number, body: Record<string, unknown>): Promise<void> {
  const res = await apiFetch(`/api/Administrateur/UpdateAdministrateur/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
}

// ─── Matières & documents ────────────────────────────────────────────────────
export async function fetchAllMatieresRaw(): Promise<Record<string, unknown>[]> {
  const raw = await apiJson<unknown>("/api/Matiere/GetAllMatiere", { skipAuth: true });
  return Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [];
}

/** Niveaux scolaires (années / promotions) — `GET /api/NiveauScolaire/GetAllNiveau` */
export async function fetchAllNiveauxRaw(): Promise<Record<string, unknown>[]> {
  const raw = await apiJson<unknown>("/api/NiveauScolaire/GetAllNiveau", { skipAuth: true });
  return Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [];
}

export function mapNiveauToOption(r: Record<string, unknown>): { id: number; nom: string } | null {
  const id = pickNum(r, "idNiveauScolaire", "IdNiveauScolaire");
  if (id == null) return null;
  const nom = pickStr(r, "nom", "Nom");
  return { id, nom: nom?.trim() ? nom : `Niveau ${id}` };
}

/** Filtre les matières liées à un niveau (`IdNiveauScolaire_fk_Matiere` ou objet imbriqué). */
export function filterMatieresByNiveauId(matieres: Record<string, unknown>[], niveauId: number): Record<string, unknown>[] {
  return matieres.filter((m) => {
    const direct = pickNum(m, "idNiveauScolaire_fk_Matiere", "IdNiveauScolaire_fk_Matiere");
    if (direct === niveauId) return true;
    const nested = asRecord(m.niveauScolaire ?? m.NiveauScolaire);
    if (nested) {
      const nid = pickNum(nested, "idNiveauScolaire", "IdNiveauScolaire");
      if (nid === niveauId) return true;
    }
    return false;
  });
}

export async function fetchAllDocumentsRaw(): Promise<Record<string, unknown>[]> {
  const raw = await apiJson<unknown>("/api/Document/GetAllDocument", { skipAuth: true });
  return Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [];
}

/** 5 années × 2 semestres = 10 semestres globaux (S1–S2 = 1ʳᵉ année, …, S9–S10 = 5ᵉ année). */
export const MAX_SEMESTRES = 10;

/** IDs niveaux triés asc. (ordre = rang d’année 1…N). */
export function mergeNiveauIdsForRanking(niveauxRaw: Record<string, unknown>[], matieres: Record<string, unknown>[]): number[] {
  const ids = new Set<number>();
  for (const n of niveauxRaw) {
    const id = pickNum(n, "idNiveauScolaire", "IdNiveauScolaire");
    if (id != null) ids.add(id);
  }
  for (const m of matieres) {
    const nid =
      pickNum(m, "idNiveauScolaire_fk_Matiere", "IdNiveauScolaire_fk_Matiere") ??
      pickNum(asRecord(m.niveauScolaire ?? m.NiveauScolaire) ?? {}, "idNiveauScolaire", "IdNiveauScolaire");
    if (nid != null) ids.add(nid);
  }
  return [...ids].sort((a, b) => a - b);
}

function matiereStableKey(m: Record<string, unknown>, idx: number): number {
  const id = pickNum(m, "idMatiere", "IdMatiere");
  if (id != null) return id;
  return -1_000_000 - idx;
}

function getMatiereNiveauId(m: Record<string, unknown>): number | undefined {
  const direct = pickNum(m, "idNiveauScolaire_fk_Matiere", "IdNiveauScolaire_fk_Matiere");
  if (direct != null) return direct;
  const nested = asRecord(m.niveauScolaire ?? m.NiveauScolaire);
  if (nested) return pickNum(nested, "idNiveauScolaire", "IdNiveauScolaire");
  return undefined;
}

function yearRankForNiveauId(niveauId: number, orderedNiveauIds: number[]): number {
  const idx = orderedNiveauIds.indexOf(niveauId);
  if (idx >= 0) return idx + 1;
  const merged = [...new Set([...orderedNiveauIds, niveauId])].sort((a, b) => a - b);
  return merged.indexOf(niveauId) + 1;
}

/**
 * Carte matière → semestre 1–10. Utilise `numeroSemestre` / `NumeroSemestre` si présent en JSON ;
 * sinon répartit les matières d’un même niveau entre S(2r−1) et S(2r) selon l’ordre des IdMatiere.
 */
function computeMatiereSemestreMap(
  matieres: Record<string, unknown>[],
  orderedNiveauIds: number[]
): Map<number, number> {
  const semMap = new Map<number, number>();

  matieres.forEach((m, idx) => {
    const key = matiereStableKey(m, idx);
    const explicit = pickNum(m, "numeroSemestre", "NumeroSemestre");
    if (explicit != null && explicit >= 1 && explicit <= MAX_SEMESTRES) {
      semMap.set(key, explicit);
    }
  });

  const byNiveau = new Map<number, Record<string, unknown>[]>();
  matieres.forEach((m, idx) => {
    const key = matiereStableKey(m, idx);
    if (semMap.has(key)) return;
    const nid = getMatiereNiveauId(m);
    const bucketKey = nid ?? -1;
    const list = byNiveau.get(bucketKey) ?? [];
    list.push(m);
    byNiveau.set(bucketKey, list);
  });

  for (const [bucketKey, list] of byNiveau) {
    const sorted = [...list].sort(
      (a, b) => (pickNum(a, "idMatiere", "IdMatiere") ?? 0) - (pickNum(b, "idMatiere", "IdMatiere") ?? 0)
    );
    const yearRank = bucketKey === -1 ? 1 : yearRankForNiveauId(bucketKey, orderedNiveauIds);
    const semA = Math.min(MAX_SEMESTRES, Math.max(1, 2 * yearRank - 1));
    const semB = Math.min(MAX_SEMESTRES, Math.max(1, 2 * yearRank));
    const mid = Math.ceil(sorted.length / 2);
    sorted.forEach((m, i) => {
      const origIdx = matieres.findIndex((x) => x === m);
      const key = matiereStableKey(m, origIdx >= 0 ? origIdx : i);
      if (semMap.has(key)) return;
      const sem = i < mid ? semA : semB;
      semMap.set(key, sem);
    });
  }

  return semMap;
}

/** Rang d’année 1…N (position du niveau de l’étudiant parmi les IDs triés). */
export function getEtudiantYearRank(etudiantRaw: Record<string, unknown> | null, orderedNiveauIds: number[]): number | null {
  if (!etudiantRaw) return null;
  const nid =
    pickNum(etudiantRaw, "idNiveauScolaire_fk_Etudiant", "IdNiveauScolaire_fk_Etudiant") ??
    pickNum(asRecord(etudiantRaw.niveauScolaire ?? etudiantRaw.NiveauScolaire) ?? {}, "idNiveauScolaire", "IdNiveauScolaire");
  if (nid == null) return null;
  const merged = [...new Set([...orderedNiveauIds, nid])].sort((a, b) => a - b);
  const idx = merged.indexOf(nid);
  return idx >= 0 ? idx + 1 : null;
}

/** Dernier semestre accessible : 2 × année (plafonné à 10). */
export function studentMaxSemestreInclusive(yearRank: number | null): number {
  if (yearRank == null || yearRank < 1) return 2;
  return Math.min(MAX_SEMESTRES, 2 * yearRank);
}

export function buildCoursDataFromApi(
  matieres: Record<string, unknown>[],
  documents: Record<string, unknown>[],
  orderedNiveauIds: number[],
  opts?: { maxSemestreInclusive?: number }
): CoursData {
  const byMatiereId = new Map<number, CoursItem[]>();
  for (const d of documents) {
    const idM = pickNum(d, "idMatiere_fk_Document", "IdMatiere_fk_Document");
    if (idM == null) continue;
    const list = byMatiereId.get(idM) ?? [];
    const titre = pickStr(d, "typeDocument", "TypeDocument") ?? "Document";
    const url = pickStr(d, "urlDocument", "UrlDocument") ?? "#";
    list.push({
      id: pickNum(d, "idDocument", "IdDocument"),
      titre,
      type: mapDocType(titre),
      fichier: url.split("/").pop() ?? "fichier",
      date: new Date().toLocaleDateString("fr"),
      size: "—",
    });
    byMatiereId.set(idM, list);
  }

  const upper = Math.min(MAX_SEMESTRES, opts?.maxSemestreInclusive ?? MAX_SEMESTRES);
  const result: CoursData = {};
  for (let s = 1; s <= upper; s++) {
    result[`Semestre ${s}`] = [];
  }

  if (!matieres.length) return result;

  const semMap = computeMatiereSemestreMap(matieres, orderedNiveauIds);

  matieres.forEach((m, idx) => {
    const key = matiereStableKey(m, idx);
    const idM = pickNum(m, "idMatiere", "IdMatiere") ?? idx;
    const sem = semMap.get(key) ?? 1;
    if (sem < 1 || sem > upper) return;

    const titre = pickStr(m, "titre", "Titre") ?? pickStr(m, "code", "Code") ?? `Matière ${idM}`;
    const cours = byMatiereId.get(idM) ?? [];
    const row = { matiere: titre, cours: cours.length ? cours : placeholderCours(titre) };
    const k = `Semestre ${sem}` as keyof CoursData;
    if (result[k]) result[k]!.push(row);
  });

  return result;
}

function mapDocType(t: string): string {
  const x = t.toLowerCase();
  if (x.includes("exam") || x.includes("épreuve")) return "Épreuve";
  if (x.includes("td") || x.includes("devoir")) return "Devoir";
  return "Cours";
}

function placeholderCours(matiere: string): CoursItem[] {
  return [
    {
      id: Math.floor(Math.random() * 1e6),
      titre: `Ressources ${matiere}`,
      type: "Cours",
      fichier: "—",
      date: "—",
      size: "—",
    },
  ];
}

const JOUR_ALIASES: Record<string, number> = {
  lundi: 0,
  lun: 0,
  mardi: 1,
  mar: 1,
  mercredi: 2,
  mer: 2,
  jeudi: 3,
  jeu: 3,
  vendredi: 4,
  ven: 4,
  samedi: 5,
  sam: 5,
};

const DEFAULT_EMPLOI_HEURES = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
const DEFAULT_JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export function matieresToEmploi(matieres: Record<string, unknown>[], joursLabels: string[]): Emploi {
  const heures = [...DEFAULT_EMPLOI_HEURES];
  const jours = joursLabels.length ? joursLabels : DEFAULT_JOURS;
  const cours: EmploiCours[] = [];
  let slot = 0;

  for (const m of matieres) {
    const titre = pickStr(m, "titre", "Titre") ?? "Matière";
    const jourStr = (pickStr(m, "jour", "Jour") ?? "lundi")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const ji = JOUR_ALIASES[jourStr] ?? JOUR_ALIASES[jourStr.slice(0, 3)] ?? (slot % 6);
    const timeVal = pickNum(m, "time", "Time");
    let hi = timeVal != null ? Math.max(0, Math.min(heures.length - 1, timeVal - 8)) : slot % (heures.length - 2);
    const ens = asRecord(m.enseignant ?? m.Enseignant);
    const prof =
      ens != null
        ? `${pickStr(ens, "prenom", "Prenom") ?? ""} ${pickStr(ens, "nom", "Nom") ?? ""}`.trim() || "—"
        : "—";
    cours.push({ jour: ji, debut: hi, duree: 1, matiere: titre, salle: "—", prof });
    slot++;
  }

  return { jours, heures, cours };
}

// ─── Conversations & messages ────────────────────────────────────────────────
export async function fetchAllConversationsRaw(): Promise<Record<string, unknown>[]> {
  const raw = await apiJson<unknown>("/api/Conversation/GetAllConversation", { skipAuth: true });
  return Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [];
}

export async function fetchMessagesRaw(idConversation: number): Promise<Record<string, unknown>[]> {
  const raw = await apiJson<unknown>(`/api/Message/conversation/${idConversation}`, { skipAuth: true });
  return Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [];
}

export async function postMessage(contenu: string, idExpediteur: number, idConversation: number): Promise<void> {
  const res = await apiFetch("/api/Message/envoyer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contenu,
      idExpediteur_fk: idExpediteur,
      idConversation_fk_Message: idConversation,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
}

export function mapApiConversationToListItem(r: Record<string, unknown>): { id: number; name: string; avatar: string } {
  const id = pickNum(r, "idConversation", "IdConversation") ?? 0;
  const nom = pickStr(r, "nom", "Nom") || `Conversation ${id}`;
  const ch = nom.trim().charAt(0).toUpperCase() || "?";
  return { id, name: nom, avatar: ch };
}

export function mapApiMessageToUi(
  m: Record<string, unknown>,
  myUserId: number
): {
  id: number;
  from: string;
  avatar: string;
  content: string;
  time: string;
  date: string;
  type: "text";
} {
  const expId = pickNum(m, "idExpediteur_fk", "IdExpediteur_fk") ?? 0;
  const exp = asRecord(m.expediteur ?? m.Expediteur);
  const fromName = exp
    ? `${pickStr(exp, "prenom", "Prenom") ?? ""} ${pickStr(exp, "nom", "Nom") ?? ""}`.trim() || "Utilisateur"
    : "Utilisateur";
  const mine = expId === myUserId;
  const rawDate = pickStr(m, "dateEnvoi", "DateEnvoi");
  const d = rawDate ? new Date(rawDate) : new Date();
  return {
    id: pickNum(m, "idMessage", "IdMessage") ?? 0,
    from: mine ? "Moi" : fromName,
    avatar: mine ? "M" : fromName.charAt(0).toUpperCase(),
    content: pickStr(m, "contenu", "Contenu") ?? "",
    time: Number.isNaN(d.getTime()) ? "—" : d.toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" }),
    date: "Aujourd'hui",
    type: "text",
  };
}

export async function postCreateConversation(body: {
  nom?: string | null;
  typeConversation: string;
  idCreateur: number;
}): Promise<Record<string, unknown>> {
  const res = await apiFetch("/api/Conversation/CreateConversation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nom: body.nom ?? null,
      typeConversation: body.typeConversation,
      idCreateur: body.idCreateur,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<Record<string, unknown>>;
}

// ─── Absences (structure UI uniquement — pas d’API Absence) ──────────────────
const SEANCES_DEFAULT = [
  { date: "5 Jan" },
  { date: "12 Jan" },
  { date: "19 Jan" },
  { date: "26 Jan" },
  { date: "2 Fév" },
  { date: "9 Fév" },
];

export function buildAbsenceDataForStudents(students: Etudiant[], matieres: string[]): AbsenceDataRow[] {
  const rows: AbsenceDataRow[] = [];
  matieres.forEach((matiere) => {
    ANNEES.forEach((annee) => {
      const etudiants = students.filter((e) => e.annee === annee);
      if (!etudiants.length) return;
      rows.push({
        matiere,
        annee,
        seances: SEANCES_DEFAULT.map((s) => ({
          date: s.date,
          presences: Object.fromEntries(etudiants.map((et) => [et.id, true])),
        })),
      });
    });
  });
  return rows;
}
