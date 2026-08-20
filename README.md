# 🛡️ Trivida Admin Panel

Panel d'administration pour l'application mobile **Trivida** — tableau de bord de suivi et de gestion.

## 📋 Overview

L'admin Trivida permet de :
- **Surveiller la croissance** des utilisateurs (inscriptions, actifs, churns)
- **Suivre la santé technique** (syncs, erreurs, quotas IA)
- **Gérer les abonnements** (Free / Basic / Premium, expirations)
- **Monitorer l'usage métier** (transactions, dettes, épargnes, factures)
- **Gérer les utilisateurs** (recherche, suspendre, réinitialiser, supprimer)
- **Piloter les mises à jour** (app update manifest)
- **Consulter le journal d'audit** (traçabilité des actions admin)

## 🏗️ Architecture

```
trivida-admin/
├── src/
│   ├── components/     # Composants réutilisables (Layout, etc.)
│   ├── context/        # React Context (AuthContext)
│   ├── pages/          # Pages du panel (8 pages)
│   ├── utils/          # Utilitaires (api.js, formatters)
│   ├── App.jsx         # Routeur principal
│   ├── main.jsx        # Point d'entrée
│   └── index.css       # Styles globaux (Tailwind)
├── index.html          # Entry HTML
├── vite.config.js      # Config Vite
├── tailwind.config.js  # Config Tailwind
└── package.json        # Dépendances
```

## 🚀 Installation

```bash
cd trivida-admin
npm install
```

## 🛠️ Développement

```bash
npm run dev
```

Le serveur de dev démarre sur **http://localhost:5174/admin/** avec proxy API vers le backend DRY (port 5000).

## 📦 Build

```bash
npm run build
```

Le build produit un dossier `dist/` qui est servi par le backend DRY via `/admin/`.

## 🔐 Authentification

L'admin utilise le même système JWT que l'app mobile :
1. Se connecter avec un compte ayant le rôle `superadmin`
2. Le token JWT est stocké dans `localStorage`
3. Toutes les requêtes API incluent le header `Authorization: Bearer <token>`

### Créer un superadmin

Dans MongoDB, mettre à jour un utilisateur existant :
```javascript
db.trividausers.updateOne(
  { email: "votre@email.com" },
  { $set: { role: "superadmin" } }
)
```

## 📊 Pages

| Page | Route | Description |
|------|-------|-------------|
| Vue d'ensemble | `/` | KPIs, courbe d'inscriptions, pie chart plans |
| Utilisateurs | `/users` | Table paginée, filtres, recherche |
| Détail utilisateur | `/users/:id` | Profil complet, stats, actions (plan/statut) |
| Sync & Santé | `/sync` | Volume sync, appareils, utilisateurs bloqués |
| IA & Quotas | `/ai` | Consommation IA, quotas, utilisation |
| Revenus & Plans | `/revenue` | Abonnements, revenus estimés, expirations |
| App Update | `/app-update` | Manifest de mise à jour mobile |
| Journal d'audit | `/logs` | Actions admin tracées |

## 🔌 API Backend

L'admin consomme les endpoints suivants (montés dans `dryApi/dryApp/Trivida/features/admin/`) :

```
POST   /api/v1/trivida/admin/login          → Authentification
GET    /api/v1/trivida/admin/users           → Liste paginée
GET    /api/v1/trivida/admin/users/:id       → Détail
PATCH  /api/v1/trivida/admin/users/:id/status → Changer statut
PATCH  /api/v1/trivida/admin/users/:id/plan   → Changer plan
GET    /api/v1/trivida/admin/stats/overview   → KPIs
GET    /api/v1/trivida/admin/stats/growth     → Croissance
GET    /api/v1/trivida/admin/stats/sync       → Sync
GET    /api/v1/trivida/admin/stats/ai         → IA
GET    /api/v1/trivida/admin/stats/revenue    → Revenus
GET    /api/v1/trivida/admin/stats/entities   → Entités
GET    /api/v1/trivida/admin/logs             → Journal audit
GET    /api/v1/trivida/admin/app/update       → Manifest
PATCH  /api/v1/trivida/admin/app/update       → Modifier manifest
```

## 🎨 Stack

| Technologie | Usage |
|-------------|-------|
| React 19 | UI library |
| Vite 6 | Build tool |
| Tailwind CSS 3 | Styling (dark mode) |
| Recharts | Graphiques |
| Lucide React | Icônes |
| React Router 7 | Routing |
| date-fns | Formatage de dates |

## 🔒 Sécurité

- Toutes les routes (sauf login) nécessitent un JWT valide + rôle `superadmin`
- Chaque action admin est loggée dans `admin_logs`
- Le token expire selon la config JWT (défaut: 7 jours)
- Rate limiting renforcé sur les routes admin
