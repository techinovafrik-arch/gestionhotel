---
description: Déroule les critères d'acceptation d'un module ou d'un lot et produit un rapport de recette
argument-hint: <module (ex. 05-reservations) ou lot (ex. L2)>
---

Recette de **$ARGUMENTS**.

1. Rassemble les critères d'acceptation : spec(s) de `docs/modules/` concernées et, pour un lot, sa définition de « terminé » dans `docs/ROADMAP.md` et les scénarios de `docs/TESTING.md` cités.
2. Pour chaque critère, trouve le test automatisé qui le couvre (par nom ou identifiant). S'il n'existe pas, écris-le.
3. Lance `pnpm test` (et `pnpm test:e2e` si des scénarios E2E sont concernés).
4. Produis `docs/recette/$ARGUMENTS.md` : tableau critère · test · résultat (✅ / ❌) · remarque, puis la liste des écarts avec leur gravité (bloquant / majeur / mineur).
5. Vérifie aussi la définition de « terminé » de `docs/TESTING.md` §5 (droits, audit, temps réel, messages en français).
6. Ne corrige rien dans cette commande : propose la liste des corrections.
