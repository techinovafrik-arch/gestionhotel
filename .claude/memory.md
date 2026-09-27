# Mémoire du projet — Hotel Manager

> Faits durables appris pendant le développement : pièges techniques, conventions adoptées, préférences de l'équipe.
> Une ligne datée par fait. Pas d'avancement ici (voir `state.md`).

## Conventions
- 2026-09-26 — Langue : code (identifiants) en français métier lorsqu'il s'agit du domaine (`folio`, `nuitee`, `imputer`), en anglais pour la technique générique (`routes`, `service`, `repo`).
- 2026-09-26 — Montants en FCFA entiers ; `splitTTC` est la seule fonction d'arrondi TVA.
- 2026-09-26 — Commits en français, format `type(module): description (EF-xx)`.

## Pièges connus
- 2026-09-26 — `better-sqlite3` est synchrone : ne jamais mettre d'`await` dans une fonction passée à `db.transaction()` ; `db.backup()` est asynchrone et doit rester hors transaction.
- 2026-09-26 — `better-sqlite3` doit être recompilé pour l'ABI d'Electron (`electron-builder install-app-deps`) et placé dans `asarUnpack`.
- 2026-09-26 — Règle TIAF : ne jamais modifier de soi-même les middlewares d'authentification et d'erreurs (incident JWT sur un précédent projet hôtelier).
- 2026-09-27 — Poste de dev : Node 24 (ABI 137), sans outils de compilation C++. `better-sqlite3` 13.x n'a pas de binaire précompilé win32/node-v137 → épinglé `~12.6.2`. Vérifier le prébuild pour l'ABI d'Electron 44 en L0.8/L0.9.
- 2026-09-27 — pnpm installé en global utilisateur (`npm i -g pnpm@10`) : `corepack enable` échoue sans droits admin.
- 2026-09-27 — pnpm 10 n'a pas lancé le postinstall d'Electron lors d'un `pnpm --filter … add` : si `node_modules/electron/dist` manque, lancer `node install.js` dans le paquet electron.
- 2026-09-27 — TypeScript épinglé `~6.0` : typescript-eslint 8.x refuse TS 7. `moduleResolution: node10` est déprécié en TS 6 → desktop en NodeNext (sortie CJS).
- 2026-09-27 — SheetJS installé depuis `cdn.sheetjs.com` (0.20.3) : le paquet `xlsx` du registre npm est figé en 0.18.5 (faille connue).
- 2026-09-27 — `@hm/shared` est consommé en source TS (exports → `src/index.ts`) ; tsup l'embarque dans le bundle serveur (`noExternal`). Imports relatifs avec suffixe `.js` côté serveur/shared.

## Préférences
- 2026-09-26 — Interface pensée pour des utilisateurs non informaticiens ; messages d'erreur qui disent quoi faire.
