# UPF E-Learning Platform

Plateforme de gestion académique — Université Privée de Fès, Campus Rabat.

## Lancer le projet

```bash
npm install
npm run dev
```

---

## Structure du projet

```
upf-platform/
├── package.json
└── src/
    │
    ├── App.jsx                         ← Point d'entrée principal
    │
    ├── data/                           ← Données & configuration
    │   ├── constants.js                ← Constantes (matières, années, couleurs...)
    │   ├── mockData.js                 ← Données fictives (cours, étudiants, messages...)
    │   └── translations.js             ← Traductions FR / EN / AR (i18n)
    │
    ├── hooks/                          ← Hooks React personnalisés
    │   └── useTheme.js                 ← Gestion mode clair / sombre
    │
    ├── components/
    │   ├── shared/                     ← Composants réutilisables
    │   │   ├── Icon.jsx                ← Bibliothèque d'icônes SVG
    │   │   └── ChatBot.jsx             ← Assistant ChatBot flottant
    │   │
    │   └── layout/                     ← Structure de l'application
    │       ├── Sidebar.jsx             ← Navigation latérale (role-aware)
    │       ├── Topbar.jsx              ← Barre supérieure (profil, dark mode...)
    │       └── Dashboard.jsx           ← Layout principal + routage des sections
    │
    └── pages/
        ├── auth/
        │   └── AuthPages.jsx           ← Page Accueil + Page Connexion
        │
        ├── etudiant/                   ← Pages accessibles à tous les profils
        │   ├── GroupesHome.jsx         ← Tableau de bord (accueil connecté)
        │   ├── EmploiDuTemps.jsx       ← Emploi du temps (filtre par année pour prof)
        │   ├── MesCours.jsx            ← Cours / Devoirs / Épreuves + upload (prof/admin)
        │   ├── MesGroupes.jsx          ← Chat de groupe + vocal + fichiers
        │   ├── Messages.jsx            ← Messagerie privée
        │   ├── MesAbsences.jsx         ← Tableau de présence (étudiant)
        │   ├── Scolarite.jsx           ← Paiements & statut boursier
        │   ├── EspaceAdmin.jsx         ← Formulaire demande → Administration
        │   ├── CreerGroupe.jsx         ← Créer un groupe de discussion
        │   ├── ProfilVoir.jsx          ← Voir le profil + description publique
        │   └── ProfilEditer.jsx        ← Modifier les informations personnelles
        │
        └── administration/             ← Pages réservées au profil Administration
            ├── AjouterEmploi.jsx       ← Ajouter / importer emplois du temps par année
            ├── GestionAbsences.jsx     ← Marquer absences par étudiant/matière/année
            ├── GestionPaiements.jsx    ← Suivi et mise à jour des paiements
            └── CreerProfil.jsx         ← Créer un compte étudiant / prof / admin
```

---

## Profils utilisateurs

| Profil         | Accès spéciaux |
|----------------|----------------|
| **Étudiant**   | Mes cours, Absences, Scolarité, Espace Admin |
| **Enseignant** | Upload cours, Emplois du temps toutes années, Créer groupe |
| **Admin**      | Toutes sections étudiant + Créer groupe |
| **Administration** | Gestion absences, paiements, profils, emplois du temps |

---

## Technologies

- **React 18** + Vite
- Styles inline (zéro dépendance CSS externe)
- i18n manuel (FR / EN / AR)
- État géré avec `useState` / hooks personnalisés
