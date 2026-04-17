/**
 * File d’attente des requêtes étudiant → administration.
 * Stockage localStorage (même origine) : visible par l’admin connecté sur le même navigateur / poste de démo.
 * Pour une mise en production multi-postes, brancher une API dédiée.
 */
export type StudentRequestRecord = {
  id: string;
  submittedAt: string;
  studentId: number;
  studentDisplayName: string;
  studentEmail: string;
  subject: string;
  message: string;
};

const STORAGE_KEY = "upf_student_requests_v1";

export const STUDENT_REQUESTS_CHANGED_EVENT = "upf_student_requests_changed";

export function loadStudentRequests(): StudentRequestRecord[] {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (!s) return [];
    const p = JSON.parse(s) as unknown;
    return Array.isArray(p) ? (p as StudentRequestRecord[]) : [];
  } catch {
    return [];
  }
}

function persist(rows: StudentRequestRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

export function appendStudentRequest(entry: {
  studentId: number;
  studentDisplayName: string;
  studentEmail: string;
  subject: string;
  message: string;
}): StudentRequestRecord {
  const row: StudentRequestRecord = {
    id: `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    submittedAt: new Date().toISOString(),
    ...entry,
  };
  const all = loadStudentRequests();
  all.unshift(row);
  persist(all);
  window.dispatchEvent(new CustomEvent(STUDENT_REQUESTS_CHANGED_EVENT));
  return row;
}
