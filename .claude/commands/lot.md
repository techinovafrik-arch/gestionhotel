---
description: Démarre ou reprend un lot de la feuille de route (ex. /lot L1)
argument-hint: <L0..L7>
---

Tu travailles sur le lot **$ARGUMENTS** de Hotel Manager.

1. Lis `CLAUDE.md`, `.claude/state.md`, `.claude/memory.md`, puis la section du lot $ARGUMENTS dans `docs/ROADMAP.md` et **toutes** les specs qu'elle cite.
2. Si la branche `lot/$ARGUMENTS-*` n'existe pas, crée-la depuis `main`.
3. Affiche la liste des tâches du lot avec leur état (fait / à faire) d'après `state.md` et le code existant.
4. Propose un plan pour la prochaine tâche non faite : fichiers à créer/modifier, migration éventuelle, endpoints, écrans, tests. **Attends mon accord** si le plan touche le schéma de base, `packages/shared/permissions.ts` ou l'architecture.
5. Exécute la tâche selon la méthode en 6 phases de `CLAUDE.md` §7 (tests d'abord pour tout calcul financier).
6. Termine par : `pnpm lint && pnpm typecheck && pnpm test`, commit thématique en français, mise à jour de `.claude/state.md`.
