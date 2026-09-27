---
description: Implémente ou complète un module à partir de sa spécification (ex. /module 08-restaurant-pos)
argument-hint: <fichier de docs/modules sans .md>
---

Module : `docs/modules/$ARGUMENTS.md`.

1. Lis la spec du module, les sections de `docs/BUSINESS_RULES.md`, `docs/DATA_MODEL.md`, `docs/API.md` et `docs/UI_UX.md` qui le concernent.
2. Fais l'inventaire : pour chaque exigence (EF-xx, RG-xx) et chaque critère d'acceptation, indique **Implémenté / Partiel / Absent** en citant le fichier.
3. Propose l'ordre de réalisation des manques (serveur → tests → routes → écrans → impression).
4. Après mon accord, implémente en respectant l'architecture en couches (`routes` minces, `service` transactionnel, `repo` privé au module, `imputer()` pour toute charge).
5. Chaque critère d'acceptation devient un test nommé avec son identifiant.
6. Mets à jour `.claude/state.md`.
