---
description: Crée une migration de base de données sûre (schéma Drizzle + SQL + seed + tests)
argument-hint: <description courte du changement>
---

Changement de schéma : **$ARGUMENTS**.

1. Vérifie la cohérence avec `docs/DATA_MODEL.md` ; si le changement n'y figure pas, propose d'abord la modification du document et attends mon accord.
2. Modifie le schéma Drizzle, puis `pnpm db:generate`. Relis le SQL généré : aucune perte de données (pas de `DROP` d'une colonne remplie sans copie).
3. Triggers, index partiels et contraintes CHECK : dans une migration SQL écrite à la main.
4. Montants en `INTEGER`, dates en `TEXT` ISO, `version` si la table est modifiée par plusieurs postes.
5. Mets à jour les seeds `base`/`demo` si nécessaire.
6. Test : migration appliquée sur une base de démo existante (copie) puis sur une base vide ; tests du module verts.
7. Mets à jour `docs/DATA_MODEL.md` et `.claude/state.md`.
