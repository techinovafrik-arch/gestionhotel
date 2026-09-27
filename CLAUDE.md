# CLAUDE.md — Hotel Manager (édition locale multi-postes Windows)

> Fichier de contexte projet pour Claude Code. Il prime sur le CLAUDE.md global TIAF.
> Lis-le en entier au début de chaque session, puis `.claude/state.md` (où en est le projet) et `.claude/memory.md` (ce qui a été appris).

## 1. Le produit en une phrase

Progiciel de gestion hôtelière **prêt à l'emploi**, installé sous Windows sur 5 à 10 postes d'un même réseau local, pour un hôtel de 30 à 100 chambres en Afrique de l'Ouest francophone. Fonctionne à 100 % **sans Internet**. Un seul installateur `.exe` : au premier lancement, un poste devient « Serveur » (API + base), les autres « Postes clients ».

Détails : `docs/PRD.md`. Cahier des charges source : `docs/PRD.md` §Sources.

## 2. Stack imposée (ne pas changer sans ADR dans `docs/DECISIONS.md`)

| Couche | Choix |
| --- | --- |
| Langage | TypeScript strict partout (`"strict": true`, pas de `any` implicite) |
| Monorepo | pnpm workspaces : `apps/desktop`, `apps/server`, `apps/web`, `packages/shared` |
| Application de bureau | Electron (dernière LTS), `electron-builder` → NSIS `.exe` x64 |
| Interface | React 19 + Vite + Tailwind CSS + TanStack Query + React Router (HashRouter) |
| Serveur | Node.js (celui embarqué par Electron), Express 4, Socket.IO, Zod |
| Base de données | SQLite via `better-sqlite3`, ORM **Drizzle** (migrations SQL versionnées), mode WAL |
| Auth | JWT 8 h + refresh token, bcryptjs (pur JS), PIN 4–6 chiffres |
| Tests | Vitest (unitaires + intégration API avec supertest), Playwright (E2E sur l'app web) |
| Impression | HTML → `webContents.print` (silencieux, imprimante du poste) et `printToPDF` |
| Excel | SheetJS (`xlsx`) pour imports/exports |

Pourquoi SQLite et pas PostgreSQL : installation sans configuration (exigence « prêt à l'emploi »). **Seul le processus serveur ouvre le fichier** ; jamais de base sur partage réseau. Voir ADR-001.

## 3. Commandes

```bash
pnpm install                 # dépendances
pnpm dev                     # serveur (4580) + web (Vite 5173) + Electron en mode dev
pnpm dev:server              # serveur seul (données dans ./data)
pnpm test                    # Vitest, tous les packages
pnpm test:e2e                # Playwright
pnpm lint && pnpm typecheck  # obligatoires avant tout commit
pnpm db:generate             # génère une migration Drizzle après modification du schéma
pnpm db:migrate              # applique les migrations
pnpm db:seed:demo            # hôtel de démonstration (30 chambres, comptes par rôle)
pnpm dist                    # build web + Electron + installateur NSIS (dist/*.exe)
```

## 4. Architecture — règles non négociables

1. **Aucun poste n'accède à la base.** Tout passe par l'API REST du serveur, qui applique droits et règles. (`docs/ARCHITECTURE.md`)
2. **Monolithe modulaire** : `apps/server/src/modules/<module>/` contient `routes.ts`, `service.ts`, `repo.ts`, `schemas.ts`, `*.test.ts`. Un module n'importe jamais le `repo` d'un autre module : il appelle son `service`.
3. **Contrôleur mince** : la route valide (Zod), vérifie la permission, appelle le service, renvoie le JSON. Aucune logique métier dans les routes.
4. **Toute écriture métier s'exécute dans une transaction** (`db.transaction`). Échec = rien n'est écrit.
5. **L'heure du serveur fait foi.** Jamais `new Date()` côté client pour une donnée métier. La date comptable = `dateExploitation()` (journée ouverte), pas la date du jour.
6. **Toute charge sur un séjour passe par le moteur d'imputation** (`modules/facturation/imputation.ts`). Aucun module n'insère directement dans `folio_lignes`.
7. **Temps réel** : après chaque mutation, `emit(topic)` via Socket.IO ; le client invalide les requêtes TanStack Query correspondantes.
8. **Types partagés** dans `packages/shared` (schémas Zod + types inférés + constantes : rôles, catégories, statuts, codes d'erreur).

## 5. Invariants métier (à vérifier dans chaque PR)

- Montants en **FCFA entiers** (`INTEGER`). Aucun `float` pour l'argent. Arrondi centralisé : `splitTTC(ttc, taux)` dans `packages/shared/money.ts`.
- **Factures** : numérotation continue, annuelle, sans trou (`FA-2027-000001`), attribuée dans la transaction avec verrou sur `compteurs`. Une facture émise n'est **jamais** modifiée ni supprimée (triggers SQL) → avoir `AV-…`.
- **Aucune suppression physique** de donnée financière, de journal d'audit ou de main courante : annulation motivée.
- **Journée clôturée = non modifiable.** Correction = ligne de régularisation sur la journée en cours.
- **Nuitée + taxe de séjour** postées **uniquement** par l'audit de nuit, une fois par nuit et par chambre (index unique).
- Chaque paiement porte : utilisateur, poste, session de caisse, date d'exploitation.
- Chaque action sensible écrit dans `audit_log` via `audit(req, action, entite, id, details)`.
- Verrouillage optimiste (`version`) sur `reservations`, `folios`, `rooms` : conflit → HTTP 409 `CONFLIT`.

Référence complète : `docs/BUSINESS_RULES.md`.

## 6. Garde-fous pour Claude Code

- ❌ **Ne jamais modifier de ta propre initiative les middlewares d'authentification et de gestion d'erreurs existants** (`apps/server/src/core/auth.ts`, `core/errors.ts`). Si un changement semble nécessaire : propose-le, explique pourquoi, attends l'accord. (Règle TIAF issue d'un incident JWT sur un précédent projet hôtelier.)
- ❌ Ne pas ajouter de dépendance native (compilation C++) autre que `better-sqlite3`. Préférer du pur JS.
- ❌ Ne pas introduire d'appel réseau sortant (CDN, API externe, polices Google) : l'app doit tourner hors ligne. Polices et icônes embarquées.
- ❌ Ne pas changer une valeur par défaut d'une règle RG sans mettre à jour `docs/BUSINESS_RULES.md`.
- ✅ Écrire les tests **avant ou avec** le code pour : calculs financiers, imputation, numérotation, caisse, audit de nuit (cible 80 % de couverture serveur).
- ✅ Interface et messages **en français**, orientés utilisateur non informaticien ; le détail technique va au journal serveur.
- ✅ Après chaque tâche : mettre à jour `.claude/state.md` (fait / en cours / suivant) et, si tu as appris quelque chose de durable sur le projet, `.claude/memory.md`.
- ✅ Petits commits thématiques, message en français : `feat(reservations): check-in avec fiche de police (EF-78)`.

## 7. Méthode de travail (6 phases TIAF)

Pour chaque lot de `docs/ROADMAP.md` :
1. **Comprendre** — lire la spec du module (`docs/modules/*.md`) et les règles citées.
2. **Planifier** — proposer un plan court (fichiers, migrations, endpoints, écrans, tests). Attendre validation si le plan touche le schéma ou l'architecture.
3. **Schéma** — migration Drizzle + seed.
4. **Serveur** — service + tests, puis routes.
5. **Interface** — écrans, états vides, erreurs, impression.
6. **Recette** — dérouler les critères d'acceptation du module, mettre à jour `state.md`.

Commandes personnalisées disponibles : `/lot`, `/module`, `/recette`, `/revue-regles`, `/etat`, `/migration` (voir `.claude/commands/`).

## 8. Carte de la documentation

| Fichier | Contenu |
| --- | --- |
| `docs/PRD.md` | Vision, périmètre, profils, objectifs |
| `docs/ARCHITECTURE.md` | Processus Electron/serveur/client, arborescence, découverte, temps réel, impression |
| `docs/DATA_MODEL.md` | Toutes les tables, champs, contraintes, index (DDL de référence) |
| `docs/BUSINESS_RULES.md` | RG-01 à RG-19, formules, algorithme d'imputation, caisse, numérotation |
| `docs/PERMISSIONS.md` | 11 rôles, matrice, validation par un responsable |
| `docs/API.md` | Conventions, codes d'erreur, liste des endpoints |
| `docs/UI_UX.md` | Écrans par rôle, design system, ergonomie, impression |
| `docs/modules/*.md` | 13 spécifications de modules (EF, écrans, critères d'acceptation) |
| `docs/ROADMAP.md` | Lots L0 → L7, tâches, définition de « terminé » |
| `docs/TESTING.md` | Stratégie de tests, scénarios de recette |
| `docs/DEPLOYMENT.md` | Build, installateur, pare-feu, sauvegardes, mises à jour, licence |
| `docs/DECISIONS.md` | Journal des décisions (ADR) |
| `docs/GLOSSARY.md` | Vocabulaire hôtelier et comptable |
| `prompts/PROMPTS_LOTS.md` | Prompts prêts à copier pour chaque lot |
