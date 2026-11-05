# 🤫 Gbairai — Réseau Social Anonyme de Confessions & Potins

Application PWA (Progressive Web App) "Mobile-First" de confessions et anecdotes locales sans authentification classique, sécurisée par hachage de Device ID (HMAC-SHA256).

---

## 🏗️ Architecture du Projet

```text
Gbairai/
├── backend/                   # API REST Laravel 11/12 (PHP 8.4)
│   ├── app/
│   │   ├── Events/            # GbairaiHidden
│   │   ├── Http/Controllers/Api/
│   │   │   ├── GbairaiController.php   # Index, Store, Show, Like, Report, Destroy
│   │   │   └── CommentController.php   # Index, Store (pseudo cohérent par thread)
│   │   ├── Http/Requests/     # StoreGbairaiRequest, StoreCommentRequest
│   │   ├── Http/Resources/    # GbairaiResource, CommentResource
│   │   ├── Models/            # Gbairai, Comment, Like
│   │   ├── Observers/         # GbairaiObserver (masque auto dès 10 signalements)
│   │   └── Services/          # DeviceService (HMAC-SHA256 + APP_KEY)
│   ├── database/migrations/   # Migrations MySQL avec index optimisés
│   └── tests/Feature/         # Suite complète de tests PHPUnit
│
└── frontend/                  # PWA Next.js (App Router, TypeScript, Tailwind CSS)
    ├── public/
    │   ├── manifest.json      # Configuration PWA & affichage standalone
    │   ├── sw.js              # Service Worker (cache réseau + mode hors-ligne)
    │   └── icons/             # Icônes SVG/PNG PWA
    └── src/
        ├── app/               # Page d'accueil, Layout, globals.css (Dark mode)
        ├── components/
        │   ├── feed/          # Feed (Infinite Scroll, tri & filtres), GbairaiCard
        │   ├── modals/        # PostModal (géolocalisation), CommentDrawer
        │   ├── layout/        # Navbar avec badge ID appareil
        │   └── providers/     # QueryProvider (TanStack React Query)
        ├── lib/               # api.ts (Fetch wrapper + X-Device-ID), device.ts (UUID v4)
        └── types/             # Types TypeScript
```

---

## 🚀 Démarrage Rapide

### 1. Démarrer le Backend (Laravel)
```bash
cd backend
php artisan serve
# L'API tourne sur http://localhost:8000
```

### 2. Démarrer le Frontend (Next.js PWA)
```bash
cd frontend
npm run dev
# L'application tourne sur http://localhost:3000
```

---

## 🛡️ Règles Métier & Sécurité
- **Zéro Mot de Passe / Email** : L'appareil génère un UUID v4 stocké localement.
- **Hachage Inviolable** : Le backend ne stocke jamais l'UUID en clair mais un hash HMAC-SHA256 avec la clé d'application (`APP_KEY`).
- **Modération Automatique** : Dès qu'un post atteint **10 signalements** (`reports_count >= 10`), un `GbairaiObserver` le bascule automatiquement en statut `'hidden'`.
- **Pseudos Cohérents** : L'auteur d'un post a le badge distinctif `Auteur (OP)`, et chaque intervenant garde le même pseudonyme anonyme (`Anonyme_1`, `Anonyme_2`, etc.) au fil de la discussion.
- **Optimistic UI** : Les likes sont mis à jour instantanément sur l'interface avant confirmation du serveur via TanStack React Query.

