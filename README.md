# UPF-Platform

> Réseau Social Académique — Hackathon  | UPF University, Institut Supérieur des Sciences de l'Ingénieur  
> **Groupe BanaTech** | Avril 2026

---

##  Description

**UPF-Platform** est une application web full-stack développée dans le cadre du Hackathon de l'UPF University. Elle offre un écosystème numérique unifié aux étudiants, enseignants et administrateurs : accès aux cours, partage d'épreuves, profils, messagerie et gestion académique complète.

---

## Architecture Technique

| Couche | Technologie | Rôle |
|--------|-------------|------|
| **Frontend** (`upf-platform/`) | React 18 + TypeScript + Vite | Interface réactive, multilangue, multi-thème |
| **Backend** (`Banane/`) | ASP.NET Core 9 + Entity Framework Core | API RESTful sécurisée, ORM, migrations |
| **Base de données** | Microsoft SQL Server (MSSQL) | Données persistantes, relations normalisées |
| **Auth** | JWT + BCrypt | Sessions sécurisées, hachage des mots de passe |

---

##  Fonctionnalités

### Obligatoires (100% implémentées)
- **Accès aux cours** — Listing, filtrage par semestre/matière, téléchargement, accès restreint JWT
- **Partage d'épreuves** — Dépôt, consultation, organisation par type et matière
- **Profils étudiants** — Création, authentification, consultation publique, modification en temps réel
- **Chats & Groupes** — Messagerie groupe/directe, fichiers, notes vocales, groupes public/privé

### Fonctionnalités Bonus
-  Support multilingue : Français / Anglais / Arabe (RTL)
-  Mode sombre / clair avec mémorisation
-  Chatbot IA assistant intégré
-  Emploi du temps multi-niveaux interactif
-  Gestion des paiements de scolarité
-  Système de requêtes étudiantes vers l'administration
-  Génération automatique de mots de passe avec envoi par e-mail
-  Documentation Swagger de l'API

---

## Profils Utilisateurs

| Profil | Accès |
|--------|-------|
| **Étudiant** | Cours, absences, scolarité, groupes, emploi du temps |
| **Enseignant** | Gestion absences, emploi du temps, messagerie |
| **Administrateur** | Tableau de bord complet, supervision globale |
| **Administration** | Emplois du temps, paiements, profils, requêtes |

---

##  Lancer le projet

### Prérequis
- Node.js 18+ et npm
- SDK .NET 9
- Microsoft SQL Server (instance `MSSQLSERVER01`)

### Backend
```bash
cd Banane
# Ouvrir Banane.sln dans Visual Studio 2022
dotnet ef database update
dotnet run
# Swagger disponible sur http://localhost:5292/swagger
```

### Frontend
```bash
cd upf-platform
npm install
# Créer .env.local avec : VITE_API_BASE_URL=http://localhost:5292
npm run dev
# Interface disponible sur http://localhost:5173
```

---

## Structure du Repo

```
HACKATHON_UPF-Platform/
├── Banane/               ← Backend ASP.NET Core 9 (API REST)
│   ├── Banane.sln
│   └── ApiBanane/
├── upf-platform/         ← Frontend React 18 + TypeScript
│   ├── package.json
│   └── src/
├── .gitignore
└── README.md
```

---

##  Sécurité

- Hachage des mots de passe avec **BCrypt**
- Authentification par **tokens JWT** avec expiration
- **CORS** configuré explicitement pour le domaine frontend
- Protection **SQL Injection** via requêtes paramétrées EF Core
- Génération de mots de passe avec `RandomNumberGenerator` cryptographique

