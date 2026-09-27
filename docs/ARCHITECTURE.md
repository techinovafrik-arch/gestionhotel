# Architecture technique

## 1. Vue d'ensemble

```
┌──────────────────────── Réseau local du personnel (switch Gigabit) ────────────────────────┐
│  Poste client (Electron)   Poste client (Electron)   Tablette étage (Electron/Chromium)    │
│        │  HTTP + WebSocket (port 4580)  │                        │                         │
│        └────────────────────────────────┼────────────────────────┘                         │
│                                         ▼                                                  │
│                    POSTE SERVEUR (Electron, mode « serveur »)                              │
│   ┌────────────────────────────────────────────────────────────────────────────────────┐   │
│   │ Processus principal Electron                                                      │   │
│   │   └─ Serveur Express + Socket.IO (apps/server) ── better-sqlite3 ── hotel.db (WAL) │   │
│   │   └─ Sert aussi l'interface web compilée (apps/web/dist) à tous les postes          │   │
│   │   └─ Répondeur UDP de découverte (port 4581)                                        │   │
│   │   └─ Planificateur : sauvegardes horaires, alertes                                  │   │
│   └────────────────────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

- **Un seul installateur** pour tous les postes. Le mode (`server` | `client`) est choisi au premier lancement et stocké dans `%APPDATA%/Hotel Manager/config.json`.
- En mode serveur, la fenêtre charge `http://localhost:4580` ; en mode client, `http://<ip-serveur>:4580`. **L'interface est servie par le serveur** : mettre à jour le serveur met à jour l'interface de tous les postes (pas de version incompatible).
- Données du serveur : `C:\ProgramData\HotelManager\` (base `hotel.db`, `sauvegardes\`, `archives-factures\`, `serveur.log`). Choisi pour survivre à un changement d'utilisateur Windows.

## 2. Monorepo

```
hotel-manager/
├─ CLAUDE.md
├─ package.json                 # scripts racine, pnpm workspaces
├─ pnpm-workspace.yaml
├─ docs/ …
├─ packages/
│  └─ shared/src/
│     ├─ constants.ts           # ROLES, MODULES, CATEGORIES, MODES_PAIEMENT, statuts
│     ├─ permissions.ts         # matrice par défaut (source unique client + serveur)
│     ├─ money.ts               # splitTTC, formatFCFA, arrondis
│     ├─ dates.ts               # addDays, diffDays, formats FR
│     ├─ errors.ts              # codes d'erreur normalisés
│     └─ schemas/*.ts           # schémas Zod partagés (entrées API)
├─ apps/
│  ├─ server/src/
│  │  ├─ index.ts               # start({ dataDir, port }) → { close }
│  │  ├─ core/
│  │  │  ├─ db.ts               # ouverture SQLite, pragmas, migrations au démarrage
│  │  │  ├─ auth.ts             # JWT, refresh, middleware authenticate  ⚠ ne pas modifier sans accord
│  │  │  ├─ errors.ts           # AppError + handler normalisé           ⚠ ne pas modifier sans accord
│  │  │  ├─ postes.ts           # enregistrement / approbation des postes (en-tête X-Poste-Id)
│  │  │  ├─ permissions.ts      # perm(module, niveau), requireValidation()
│  │  │  ├─ audit.ts            # audit(req, action, entite, id, details)
│  │  │  ├─ realtime.ts         # Socket.IO, emit(topics), notify(role, message)
│  │  │  ├─ journee.ts          # dateExploitation(), journeeCourante()
│  │  │  ├─ numerotation.ts     # nextNumber(serie) sans trou
│  │  │  └─ params.ts           # param(cle) / setParam avec valeurs par défaut
│  │  ├─ db/schema/*.ts         # tables Drizzle (une par domaine)
│  │  ├─ db/migrations/*.sql
│  │  ├─ db/seed/{base,demo}.ts
│  │  ├─ modules/<module>/{routes,service,repo,schemas}.ts + *.test.ts
│  │  ├─ jobs/{sauvegarde,alertes}.ts
│  │  └─ discovery.ts           # UDP 4581
│  ├─ web/src/
│  │  ├─ main.tsx, App.tsx, router.tsx
│  │  ├─ api/client.ts          # fetch + jetons + X-Poste-Id + gestion 401/409/428
│  │  ├─ api/realtime.ts        # socket.io-client → queryClient.invalidateQueries
│  │  ├─ components/ui/*        # Button, Input, Modal, DataTable, Badge, Tabs, ValidationDialog…
│  │  ├─ features/<module>/*    # pages et composants par module
│  │  ├─ print/*                # gabarits facture A4, ticket 80 mm, fiche de police, rapports
│  │  └─ styles/tokens.css
│  └─ desktop/src/
│     ├─ main.ts                # cycle de vie, mode serveur/client, fenêtre, tray, auto-lancement
│     ├─ preload.ts             # window.hm = { posteId, posteNom, print, savePDF, config, cachePresents }
│     ├─ setup.html             # écran de choix Serveur / Client
│     └─ offline.html           # mode dégradé (liste des présents en cache)
└─ build/installer.nsh          # règles pare-feu, dossier ProgramData
```

## 3. Couches serveur

| Couche | Rôle | Règle |
| --- | --- | --- |
| Routes | Validation Zod, permission, appel service, JSON | Aucune logique métier, aucun SQL |
| Service | Règles de gestion, calculs, transaction, audit, `emit` | Seul point d'entrée d'un module pour les autres |
| Repo | Requêtes Drizzle sur les tables **du module** | Jamais importé hors du module |
| Core | Transverse (auth, erreurs, audit, temps réel, numérotation, paramètres) | Stable, modifié avec prudence |

Dépendances autorisées entre modules (un module appelle le **service** de ceux dont il dépend) :

```
securite ← referentiel ← hebergement ← reservations → facturation
clientele ← reservations ; groupes → reservations, facturation
restaurant → facturation, stocks ; services-annexes → facturation
etages → hebergement, facturation (minibar) ; exploitation → facturation, reservations
comptabilite → facturation, exploitation ; rapports → lecture seule partout
```

## 4. Transactions et concurrence

- `better-sqlite3` est synchrone : chaque requête métier s'exécute dans `db.transaction(() => …)()`. Un seul processus écrit → pas de corruption.
- Pragmas au démarrage : `journal_mode=WAL`, `synchronous=FULL`, `foreign_keys=ON`, `busy_timeout=5000`.
- Verrouillage optimiste : `UPDATE … SET …, version = version + 1 WHERE id = ? AND version = ?` ; 0 ligne → `409 CONFLIT` ; le client affiche « Modifié par un autre poste » et recharge.
- Numérotation : `compteurs(serie, annee, valeur)` incrémenté dans la transaction qui crée le document.

## 5. Postes et authentification

- Au premier lancement, `preload` génère un `posteId` (UUID) stocké dans `config.json`. Chaque requête porte `X-Poste-Id` et `X-Poste-Nom`.
- Un poste inconnu est créé `approuve=0` ; il reçoit `403 POSTE_NON_APPROUVE` jusqu'à approbation par l'ADMIN. Le **tout premier poste** (le serveur) est approuvé automatiquement.
- Connexion : login + mot de passe ou PIN → `accessToken` (JWT 8 h, payload `{uid, pid}`) + `refreshToken` (7 jours, table `refresh_tokens`). Le client renouvelle en silence sur 401.
- Verrouillage d'écran après 15 min d'inactivité (paramétrable) : ressaisie du mot de passe ou du PIN.

## 6. Temps réel

- Socket.IO sur le même port, authentifié par le JWT (`handshake.auth.token`). Chaque socket rejoint la salle de son rôle.
- Le serveur émet `change { topics: ['rooms','planning',…] }` après chaque mutation ; le client mappe chaque topic vers des clés TanStack Query à invalider.
- `notification { role, message, niveau }` pour les alertes (chambre prête, écart de caisse à valider, stock bas…).
- `bon_preparation` pour les écrans/imprimantes cuisine et bar.

Topics : `rooms, planning, reservations, clients, groupes, folios, factures, caisse, pos, cuisine, stocks, housekeeping, maintenance, objets, services, main_courante, consignes, journee, parametres`.

## 7. Découverte du serveur

Le client envoie en diffusion UDP `HOTEL_MANAGER_DISCOVER` sur le port 4581 ; le serveur répond `{ app, port, nom, version }`. À défaut (VLAN, pare-feu), saisie manuelle de l'IP. Vérification finale : `GET /api/health`.

## 8. Impression et périphériques

- Le poste stocke ses imprimantes (A4, ticket 80 mm, cuisine) dans la table `postes`.
- `window.hm.print(html, { type: 'A4' | 'TICKET' | 'CUISINE', silencieux })` → le processus principal ouvre une fenêtre cachée, charge le HTML et appelle `webContents.print({ deviceName, silent })`.
- `window.hm.savePDF(html, nomFichier)` → `printToPDF` + boîte « Enregistrer sous ».
- Tiroir-caisse : ouvert par le pilote de l'imprimante ticket (option « ouvrir le tiroir à l'impression »), uniquement pour un encaissement en espèces.
- Lecteur de codes-barres USB : émulation clavier, champ de saisie focalisé + touche Entrée.
- Hors Electron (navigateur, tablette), repli sur `window.print()`.

## 9. Mode dégradé (serveur injoignable)

- Le client met en cache toutes les 5 min la liste des présents (`GET /api/presents`) via `window.hm.cachePresents()` dans `%APPDATA%`.
- Si le serveur ne répond plus : bandeau rouge, tentative de reconnexion toutes les 5 s, bouton « Mode secours » qui ouvre `offline.html` (liste des présents imprimable + fiche de secours vierge).

## 10. Sauvegardes

- `db.backup()` (API en ligne de better-sqlite3, sans arrêt) : horaire + nocturne (étape 7 de l'audit) + manuelle + avant chaque migration.
- Copie optionnelle vers un dossier externe (second disque, NAS, clé USB), chiffrée AES-256-CBC si une clé est définie.
- Rétention 7 jours / 4 semaines / 12 mois ; horaires gardées 48 h.
- Restauration : l'ADMIN choisit une sauvegarde → fichier drapeau → appliquée au redémarrage du serveur (la base courante est d'abord copiée).

## 11. Sécurité réseau

- Le serveur écoute sur `0.0.0.0:4580` ; l'installateur ouvre le port **uniquement pour le profil réseau privé** du pare-feu Windows.
- Le fichier `hotel.db` n'est jamais partagé ; `ProgramData\HotelManager` n'est pas un partage réseau.
- HTTPS local (certificat auto-signé généré à l'installation, empreinte épinglée par le client Electron) : lot L0 si le temps le permet, sinon L7 — voir ADR-004.
