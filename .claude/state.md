# État du projet — Hotel Manager

> Mis à jour par Claude Code à la fin de chaque tâche (`/etat`). Lu au début de chaque session.

## Lot en cours
Aucun — monorepo initialisé ; prochaine étape : **L0** (`/lot L0`).

## Avancement par lot
| Lot | Statut | Branche | Remarque |
| --- | --- | --- | --- |
| L0 Socle local | En cours | — | L0.1 fait (monorepo) |
| L1 Hébergement | À faire | — | |
| L2 Exploitation | À faire | — | Version pilote hébergement |
| L3 Restaurant / bar | À faire | — | |
| L4 Stocks | À faire | — | |
| L5 Étages | À faire | — | |
| L6 Comptabilité | À faire | — | |
| L7 Recette | À faire | — | |

## Dernières tâches terminées
- 2026-09-27 — Initialisation du monorepo (Prompt 1 / L0.1) : pnpm workspaces (`apps/server`, `apps/web`, `apps/desktop`, `packages/shared`), TS strict, ESLint + Prettier, Vitest, Playwright, scripts CLAUDE.md §3. Serveur : `start({ dataDir, port })` + `GET /api/health` seulement. Web : Vite + React 19 + Tailwind 4 + TanStack Query + HashRouter (page provisoire). Desktop : `main.ts` Electron minimal.

## Tâche en cours
- (aucune)

## Prochaine tâche
- L0 : proposer le plan L0.2 → L0.11 (prompt L0), en commençant par L0.2 `packages/shared` (constantes, permissions, money, dates, erreurs + tests).

## Points bloquants / décisions en attente
- Paramètres fiscaux réels de l'hôtel pilote (TVA par famille, taxe de séjour) — valeurs par défaut en attendant.
- Confirmation de SQLite (ADR-001).
- Scripts `db:migrate`, `db:seed:demo` et `dist` branchés mais volontairement en échec explicite (« pas encore disponible ») jusqu'à L0.3 / L0.10 / L0.9.

## Derniers tests
- 2026-09-27 — `pnpm lint`, `pnpm typecheck`, `pnpm test` verts (shared 1 test, server 2 tests, web aucun test). Builds web/server/desktop OK.
