# Kit Application — Hotel Manager

Ce dossier contient tout ce dont Claude Code a besoin pour développer **Hotel Manager**, le logiciel de gestion hôtelière prêt à l'emploi, multi-postes, en réseau local Windows, décrit dans le cahier des charges TIAF du 26/09/2026.

## Contenu

```
CLAUDE.md                      ← contexte lu automatiquement par Claude Code (stack, règles, garde-fous, méthode)
README.md                      ← ce fichier
docs/
  PRD.md                       vision, périmètre, rôles, objectifs
  ARCHITECTURE.md              Electron serveur/client, monorepo, couches, temps réel, impression, sauvegardes
  DATA_MODEL.md                ≈ 60 tables, statuts, numérotation, DDL SQL de référence
  BUSINESS_RULES.md            RG-01 à RG-19, TVA, taxe de séjour, moteur d'imputation, check-out, caisse, audit de nuit, écritures
  PERMISSIONS.md               11 rôles, matrice, validation par un responsable (HTTP 428)
  API.md                       conventions, codes d'erreur, catalogue des endpoints
  UI_UX.md                     principes, design system, écrans par rôle, impression
  TESTING.md                   pyramide de tests, 10 scénarios de recette, performance, définition de « terminé »
  DEPLOYMENT.md                build electron-builder, installateur NSIS, mises à jour, licence
  DECISIONS.md                 ADR (SQLite, installateur unique, Drizzle, HTTPS, avoirs…)
  GLOSSARY.md                  vocabulaire hôtelier et comptable
  ROADMAP.md                   lots L0 → L7 avec tâches et critères de fin
  modules/01 … 13-*.md         une spécification par module : exigences, écrans, critères d'acceptation
prompts/PROMPTS_LOTS.md        prompts prêts à copier, un par lot, + prompts utilitaires
.claude/
  settings.json                permissions Claude Code (commandes autorisées / interdites)
  state.md                     avancement (mis à jour à chaque tâche)
  memory.md                    faits durables du projet
  commands/                    /lot  /module  /recette  /revue-regles  /etat  /migration
  agents/                      regles-metier-reviewer  testeur-recette  ux-francais
```

## Démarrage (Windows, VS Code)

1. Prérequis : Node.js 22 LTS, pnpm (`npm i -g pnpm`), Git, Claude Code, outils de build Windows pour `better-sqlite3` (installés avec Node en cochant « Tools for Native Modules »).
2. Crée le dossier du projet, par exemple `Documents\TECHNOLOGIE-INNOVATION-AFRIK\developpement\hotel-manager\`, et copie-y **tout le contenu de ce kit** (y compris le dossier caché `.claude`).
3. Ouvre le dossier dans VS Code, lance `claude` dans le terminal.
4. Colle le **Prompt 1** de `prompts/PROMPTS_LOTS.md` (initialisation du monorepo).
5. Enchaîne les lots : `/lot L0`, puis `/lot L1`, etc. Une session = une ou deux tâches ; termine chaque session par `/etat`.
6. Après chaque fonctionnalité sensible (argent, caisse, imputation) : « Utilise l'agent regles-metier-reviewer ». Avant de clore un lot : `/recette L<n>`.

## Conseils de pilotage

- **Valide les plans** : Claude Code propose un plan avant chaque tâche qui touche le schéma ou l'architecture ; lis-le, c'est là que se jouent les erreurs coûteuses.
- **Tests d'abord pour l'argent** : exige de voir les tests du moteur d'imputation, des factures et de la caisse passer avant les écrans.
- **Une branche par lot**, fusion dans `main` seulement quand le lot est recetté.
- **Fin de L0** : active le verrou des middlewares (tâche L0.11) — Claude Code ne pourra plus modifier `auth.ts` et `errors.ts` sans que tu retires la règle.
- **Points ouverts du CDC** (TVA, taxe de séjour, fiche de police, logiciel comptable) : le code utilise des valeurs par défaut paramétrables ; quand une réponse arrive, utilise le prompt « Nouvelle règle ou changement de paramètre ».
- Si un document du kit et le code divergent, c'est le document qui fait foi, sauf décision contraire consignée dans `docs/DECISIONS.md`.
