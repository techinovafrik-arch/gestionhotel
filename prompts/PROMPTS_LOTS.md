# Prompts prêts à copier dans Claude Code

Mode d'emploi : ouvre le dossier du projet dans VS Code, lance `claude`, colle le prompt du lot. Commence **toujours** une nouvelle session par le prompt 0 si tu reprends après une pause. Un lot peut demander plusieurs sessions : termine chaque session par `/etat`.

---

## Prompt 0 — Reprise de session

```
Lis CLAUDE.md, puis .claude/state.md et .claude/memory.md.
Résume en 5 lignes : lot en cours, dernière tâche terminée, tâche suivante, points bloquants.
Ne code rien avant que je confirme la tâche suivante.
```

## Prompt 1 — Initialisation (avant L0, dossier vide contenant ce kit)

```
Tu démarres le projet Hotel Manager. Lis CLAUDE.md, docs/PRD.md, docs/ARCHITECTURE.md et docs/DECISIONS.md.
Crée le monorepo décrit dans ARCHITECTURE.md §2 (pnpm workspaces, TypeScript strict, ESLint, Prettier, Vitest)
avec les scripts exacts de CLAUDE.md §3, sans encore écrire de logique métier.
Vérifie que `pnpm install`, `pnpm lint`, `pnpm typecheck` et `pnpm test` passent.
Initialise git, premier commit « chore: initialisation du monorepo », puis remplis .claude/state.md.
```

## Prompt L0 — Socle local

```
Lot L0 (docs/ROADMAP.md). Lis docs/modules/01-securite.md, 02-referentiel.md, docs/DATA_MODEL.md (tables sécurité,
parametres, journees, compteurs, audit_log), docs/PERMISSIONS.md et docs/DEPLOYMENT.md.
Propose d'abord un plan découpé en tâches L0.1 à L0.10 avec les fichiers créés pour chacune. Attends mon accord.
Ensuite, tâche par tâche : tests d'abord pour packages/shared et le core (numérotation sans trou en concurrence,
permissions, requireValidation → 428), puis implémentation. Les middlewares auth.ts et errors.ts que tu crées
deviennent ensuite intouchables sans mon accord.
À la fin de chaque tâche : lint + typecheck + tests, commit, mise à jour de .claude/state.md.
```

## Prompt L1-a — Tarifs, disponibilités, facturation

```
Lot L1, tâches L1.1 à L1.4. Lis docs/modules/03-hebergement.md, 07-facturation.md, docs/BUSINESS_RULES.md §2 à §7
et docs/DATA_MODEL.md.
1. Migration Drizzle des tables hébergement, clientèle, réservations, groupes, facturation (triggers factures inclus).
2. Services purs testés : tarif (RG-01), taxe de séjour, disponibilité (§3), pénalités (RG-04).
3. Moteur d'imputation (§4) : écris d'abord les tests de l'exemple de référence de docs/modules/06-groupes.md,
   puis le code. Invariant testé : somme des parts = montant consommé.
4. Folios, paiements, cautions, factures, avoirs ; test de 20 factures concurrentes sans trou.
Montre-moi le résultat des tests avant de passer aux routes.
```

## Prompt L1-b — Réservations et séjour

```
Lot L1, tâche L1.5. Lis docs/modules/05-reservations.md et BUSINESS_RULES.md §6.
Implémente le service puis les routes réservations (création, modification avec version, annulation, changement de
chambre, prolongation, walk-in, day-use, check-in avec fiche de police, pré-check-out, check-out).
Chaque critère d'acceptation du module devient un test d'intégration nommé. Toute charge passe par imputer().
```

## Prompt L1-c — Groupes

```
Lot L1, tâche L1.6. Lis docs/modules/06-groupes.md. Implémente bloc, chef, membres, rooming list (import de lignes
JSON produites côté web par SheetJS), jeux de règles (modèles, BROUILLON→SOUMIS→VALIDE, hors politique + accord
directeur, empreinte, versions), simulation, confirmation, relevés, clôture du compte collectif. Tests des critères.
```

## Prompt L1-d — Écrans hébergement

```
Lot L1, tâches L1.7 à L1.9. Lis docs/UI_UX.md en entier.
Construis les écrans : Réception, Planning (glisser-déposer, virtualisation), Nouvelle réservation, Fiche réservation,
Check-in, Check-out, Folio, Factures, Clients, Entreprises, Groupes (éditeur de règles + simulation), Chambres, Tarifs,
et les gabarits d'impression (facture A4, fiche de police, relevé, récapitulatif des règles).
Composants réutilisables d'abord (ClientPicker, RoomPicker, PaymentForm, ValidationDialog, MoneyInput, DataTable).
Ajoute un test Playwright pour le scénario 2 de docs/TESTING.md.
```

## Prompt L2 — Exploitation

```
Lot L2. Lis docs/modules/12-exploitation.md et BUSINESS_RULES.md §8, §9, §13.
Implémente sessions de caisse (comptage à l'aveugle : l'API ne renvoie pas l'attendu avant clôture), main courante et
consignes, audit de nuit en 8 étapes bloquantes idempotentes, rapport journalier, écritures de clôture équilibrées,
blocage des journées clôturées. Écrans Ma caisse, Sessions, Main courante, Consignes, Audit de nuit (stepper),
Tableau de bord. Tests : scénarios 5, 7, 8 de TESTING.md. Simule ensuite 3 nuits complètes avec les données de démo.
```

## Prompt L3 — Restaurant, bar, services annexes

```
Lot L3. Lis docs/modules/08-restaurant-pos.md et 11-services-annexes.md.
Serveur puis écran de caisse tactile (plein écran, boutons ≥ 44 px, champ code-barres toujours focalisé),
bons cuisine/bar (impression 80 mm + événement temps réel), encaissement avec rendu, transfert sur chambre via
imputer() avec affichage de la répartition, ticket Z. Puis blanchisserie, transport (conflits de véhicule), salles.
Chaque critère d'acceptation = un test.
```

## Prompt L4 — Stocks

```
Lot L4. Lis docs/modules/09-stocks.md et BUSINESS_RULES.md §11. Implémente articles, magasins, mouvements, CMP,
fiches techniques branchées sur les ventes POS (RG-16), bons de commande et réceptions partielles avec conversion
d'unités, inventaires avec code-barres, alertes, rapport de marges. Tests des critères.
```

## Prompt L5 — Étages

```
Lot L5. Lis docs/modules/10-etages.md et BUSINESS_RULES.md §12. Plan des étages tactile, cycle d'entretien (PROPRE
réservé gouvernante), plan du jour et affectation par crédits, minibar via imputer(), linge, divergences branchées
sur l'étape 3 de l'audit, maintenance (bloquant → hors service), préventive, objets trouvés.
```

## Prompt L6 — Comptabilité

```
Lot L6. Lis docs/modules/13-comptabilite-rapports.md. Correspondances éditables, écritures complètes avec test
d'équilibre par journée, journaux, balance âgée, états TVA et taxe de séjour, exports CSV (; UTF-8 BOM) et Excel,
clôture mensuelle, tous les rapports avec export PDF/Excel, file DGI derrière une interface DgiTransmitter.
```

## Prompt L7 — Recette et livraison

```
Lot L7. Lis docs/TESTING.md et docs/DEPLOYMENT.md. HTTPS local (ADR-004), licence hors ligne, contrôle de version
des coques clientes, tests de charge 10 postes, base de 10 ans générée, guides (installation et un guide par rôle
dans docs/guides/), modèles d'import Excel, build signé. Liste-moi ensuite tout écart restant avec le CDC.
```

---

## Prompts utilitaires

**Revue d'une fonctionnalité**
```
Utilise l'agent regles-metier-reviewer pour relire les changements de la branche courante contre
docs/BUSINESS_RULES.md et CLAUDE.md §5. Corrige ce qui est confirmé, liste le reste.
```

**Correction d'un bug signalé par l'hôtel**
```
Bug signalé : <description, écran, message affiché, heure>. Reproduis-le d'abord par un test qui échoue,
puis corrige sans toucher à core/auth.ts ni core/errors.ts. Explique la cause en 3 lignes.
```

**Nouvelle règle ou changement de paramètre**
```
Nouvelle règle : <règle>. Mets à jour docs/BUSINESS_RULES.md (nouvel identifiant RG), ajoute le paramètre avec sa
valeur par défaut, les tests, puis le code. Ajoute une entrée dans docs/DECISIONS.md si l'architecture change.
```
