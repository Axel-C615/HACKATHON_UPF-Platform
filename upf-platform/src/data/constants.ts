import type { ColorsMatieres, TypeColors, TypeIcons, Emploi } from "../types";

// ─── CONSTANTES GLOBALES ─────────────────────────────────────────────────────

export const MATIERES: string[] = [
  "Mathématiques",
  "Informatique",
  "Physique",
  "Anglais",
  "Droit des affaires",
  "Gestion",
];

export const ANNEES: string[] = ["1GI", "2GI", "3GI", "1GTIC", "2GTIC"];

export const COLORS_MATIERES: ColorsMatieres = {
  "Mathématiques":    "#3b82f6",
  "Informatique":     "#8b5cf6",
  "Physique":         "#10b981",
  "Anglais":          "#f59e0b",
  "Droit des affaires": "#ef4444",
  "Gestion":          "#06b6d4",
};

export const TYPE_COLORS: TypeColors = {
  Cours:    "#3b82f6",
  Devoir:   "#f59e0b",
  Épreuve:  "#ef4444",
};

export const TYPE_ICONS: TypeIcons = {
  Cours:   "📖",
  Devoir:  "✏️",
  Épreuve: "📝",
};

export const EMPLOI: Emploi = {
  jours: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"],
  heures: [
    "08:00", "09:00", "10:00", "11:00",
    "12:00", "13:00", "14:00", "15:00",
    "16:00", "17:00"
  ],
  cours: [
    { jour: 0, debut: 0, duree: 2, matiere: "Mathématiques",      salle: "A101", prof: "M. Alaoui" },
    { jour: 0, debut: 3, duree: 1, matiere: "Informatique",        salle: "B204", prof: "Mme. Benali" },
    { jour: 1, debut: 1, duree: 2, matiere: "Physique",            salle: "C305", prof: "M. Chraibi" },
    { jour: 1, debut: 4, duree: 1, matiere: "Anglais",             salle: "A102", prof: "Mme. Idrissi" },
    { jour: 2, debut: 0, duree: 1, matiere: "Droit des affaires",  salle: "D101", prof: "M. Tazi" },
    { jour: 2, debut: 2, duree: 2, matiere: "Gestion",             salle: "B201", prof: "Mme. Fassi" },
    { jour: 3, debut: 1, duree: 1, matiere: "Mathématiques",       salle: "A103", prof: "M. Alaoui" },
    { jour: 3, debut: 3, duree: 2, matiere: "Informatique",        salle: "B205", prof: "Mme. Benali" },
    { jour: 4, debut: 0, duree: 2, matiere: "Physique",            salle: "C306", prof: "M. Chraibi" },
    { jour: 4, debut: 3, duree: 1, matiere: "Anglais",             salle: "A104", prof: "Mme. Idrissi" },
  ],
};
