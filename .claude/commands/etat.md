---
description: Met à jour .claude/state.md (et memory.md si utile) en fin de tâche ou de session
---

1. Regarde `git log` depuis la dernière mise à jour de `.claude/state.md`, les fichiers modifiés et le résultat de `pnpm test`.
2. Mets à jour `.claude/state.md` : lot en cours, tâches faites (avec commit), tâche en cours, prochaine tâche, points bloquants, décisions en attente, dernière exécution des tests (nombre, échecs, couverture si disponible).
3. Si tu as appris un fait durable sur le projet (piège technique, convention adoptée, préférence exprimée), ajoute-le à `.claude/memory.md` en une ligne datée. N'y mets pas l'avancement (c'est le rôle de `state.md`).
4. Affiche le résumé en 5 lignes.
