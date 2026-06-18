import { MATIERES } from "./constants";
import type { Etudiant, CoursData, Emploi, AbsenceDataRow, AbsencesAdmin, MessageData } from "../types";

// ─── ÉTUDIANTS ────────────────────────────────────────────────────────────────
export const ETUDIANTS_LIST: Etudiant[] = [
  { id: "ET001", nom: "Youssef Benali",      annee: "2GI",   email: "y.benali@upf.ac.ma",   statut: "Actif", paiement: "Partiel",  paye: 18000, total: 28000 },
  { id: "ET002", nom: "Fatima Zahra Alami",  annee: "2GI",   email: "f.alami@upf.ac.ma",    statut: "Actif", paiement: "Complet",  paye: 28000, total: 28000 },
  { id: "ET003", nom: "Mehdi Tazi",          annee: "3GI",   email: "m.tazi@upf.ac.ma",     statut: "Actif", paiement: "Non payé", paye: 0,     total: 28000 },
  { id: "ET004", nom: "Salma Idrissi",       annee: "1GI",   email: "s.idrissi@upf.ac.ma",  statut: "Actif", paiement: "Partiel",  paye: 10000, total: 28000 },
];

// ─── COURS ────────────────────────────────────────────────────────────────────
/** Structure vide S1…S10 pour l’UI (onglets) ; S1–S2 remplies par le mock ci-dessous. */
export function coursDataTenSemestersFallback(base: CoursData = COURS_DATA): CoursData {
  const out: CoursData = {};
  for (let s = 1; s <= 10; s++) {
    const key = `Semestre ${s}`;
    out[key] = base[key] ? [...base[key]!] : [];
  }
  return out;
}

export const COURS_DATA: CoursData = {
  "Semestre 1": MATIERES.map((m) => ({
    matiere: m,
    cours: [
      { id: 1, titre: `Introduction à ${m}`,    type: "Cours",   fichier: "cours_intro.pdf",  date: "10 Jan 2025", size: "2.4 MB" },
      { id: 2, titre: `TD ${m} — Série 1`,       type: "Devoir",  fichier: "td1.pdf",          date: "20 Jan 2025", size: "1.1 MB" },
      { id: 3, titre: `Examen mi-parcours ${m}`, type: "Épreuve", fichier: "exam.pdf",         date: "15 Fév 2025", size: "890 KB" },
    ],
  })),
  "Semestre 2": MATIERES.map((m) => ({
    matiere: m,
    cours: [
      { id: 4, titre: `${m} Avancé`,       type: "Cours",   fichier: "cours_avance.pdf", date: "5 Mar 2025",  size: "3.2 MB" },
      { id: 5, titre: `Projet ${m}`,       type: "Devoir",  fichier: "projet.pdf",       date: "1 Avr 2025",  size: "1.8 MB" },
      { id: 6, titre: `Examen Final ${m}`, type: "Épreuve", fichier: "final.pdf",        date: "10 Jun 2025", size: "950 KB" },
    ],
  })),
};

// ─── EMPLOI DU TEMPS ──────────────────────────────────────────────────────────
export const EMPLOI: Emploi = {
  jours:  ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
  heures: ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"],
  cours: [
    { jour: 0, debut: 0, duree: 2, matiere: "Mathématiques",    salle: "A101",   prof: "Pr. Alaoui"    },
    { jour: 0, debut: 3, duree: 2, matiere: "Informatique",     salle: "Labo 2", prof: "Pr. Tazi"      },
    { jour: 1, debut: 1, duree: 2, matiere: "Physique",         salle: "B203",   prof: "Pr. Moussaoui" },
    { jour: 1, debut: 4, duree: 1, matiere: "Anglais",          salle: "C105",   prof: "Pr. Smith"     },
    { jour: 2, debut: 0, duree: 3, matiere: "Gestion",          salle: "D301",   prof: "Pr. Idrissi"   },
    { jour: 3, debut: 2, duree: 2, matiere: "Droit des affaires",salle: "E202",  prof: "Pr. Fassi"     },
    { jour: 4, debut: 0, duree: 2, matiere: "Informatique",     salle: "Labo 1", prof: "Pr. Tazi"      },
    { jour: 5, debut: 1, duree: 2, matiere: "Mathématiques",    salle: "A101",   prof: "Pr. Alaoui"    },
  ],
};

// ─── ABSENCES ─────────────────────────────────────────────────────────────────

const seancesBase = [
  { date: "5 Jan" },
  { date: "12 Jan" },
  { date: "19 Jan" },
  { date: "26 Jan" },
  { date: "2 Fév" },
  { date: "9 Fév" },
];

// Structure : [{ matiere, annee, seances: [{ date, presences: { [etudiantId]: true/false } }] }]
export const ABSENCES_DATA: AbsenceDataRow[] = [];
MATIERES.forEach((matiere) => {
  // Pour chaque année, on crée un bloc d'absences
  (["1GI", "2GI", "3GI", "1GTIC", "2GTIC"] as string[]).forEach((annee) => {
    const etudiants = ETUDIANTS_LIST.filter((e) => e.annee === annee);
    if (etudiants.length === 0) return;
    ABSENCES_DATA.push({
      matiere,
      annee,
      seances: seancesBase.map((s) => ({
        date: s.date,
        presences: Object.fromEntries(etudiants.map((et) => [et.id, true])) // Par défaut tous présents
      }))
    });
  });
});

// Fonction pour obtenir les matières enseignées par un prof
export const getMatieresEnseignees = (profName: string): string[] => {
  const matieres = EMPLOI.cours
    .filter((c) => c.prof === profName)
    .map((c) => c.matiere);
  return [...new Set(matieres)]; // Retirer les doublons
};

export const ABSENCES_ADMIN: AbsencesAdmin = {
  ET001: MATIERES.map((m) => ({
    matiere: m,
    seances: [
      { date: "5 Jan",  present: true  },
      { date: "12 Jan", present: false },
      { date: "19 Jan", present: true  },
      { date: "26 Jan", present: true  },
      { date: "2 Fév",  present: false },
      { date: "9 Fév",  present: true  },
    ],
  })),
  ET002: MATIERES.map((m) => ({
    matiere: m,
    seances: [
      { date: "5 Jan",  present: true  },
      { date: "12 Jan", present: true  },
      { date: "19 Jan", present: false },
      { date: "26 Jan", present: true  },
      { date: "2 Fév",  present: true  },
      { date: "9 Fév",  present: true  },
    ],
  })),
};

// ─── MESSAGES ─────────────────────────────────────────────────────────────────
export const MESSAGES_DATA: MessageData[] = [
  { id: 1, from: "Administration", avatar: "A", content: "Votre dossier d'inscription a été validé.", time: "09:30", date: "Aujourd'hui", unread: true  },
  { id: 2, from: "Prof. Benali",   avatar: "B", content: "Le cours de demain est reporté.",           time: "11:00", date: "Aujourd'hui", unread: true  },
  { id: 3, from: "Fatima Z.",      avatar: "F", content: "Tu as les notes du dernier TD?",            time: "14:22", date: "Hier",        unread: false },
];
