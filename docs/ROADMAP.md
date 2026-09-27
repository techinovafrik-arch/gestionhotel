# Feuille de route — lots L0 à L7

36 semaines estimées pour un développeur principal (en vibecoding, les durées réelles seront plus courtes ; l'ordre, lui, est impératif). **Un lot = une branche `lot/Lx-nom`**, fusionnée seulement quand sa définition de « terminé » est remplie. Dès la fin de L2, une version hébergement peut être mise en service dans un hôtel pilote.

Pour démarrer un lot dans Claude Code : `/lot L0` (voir `.claude/commands/lot.md`) ou copier le prompt de `prompts/PROMPTS_LOTS.md`.

---

## L0 — Socle local (≈ 4 sem.)
Specs : `ARCHITECTURE.md`, `modules/01-securite.md`, `modules/02-referentiel.md`, `DEPLOYMENT.md`

- [ ] L0.1 Monorepo pnpm (`apps/server`, `apps/web`, `apps/desktop`, `packages/shared`), TypeScript strict, ESLint, Prettier, Vitest, scripts racine du `CLAUDE.md`
- [ ] L0.2 `packages/shared` : constantes, matrice de permissions, `money.ts`, `dates.ts`, codes d'erreur + tests
- [ ] L0.3 Serveur : `start({ dataDir, port })`, pragmas SQLite, Drizzle + première migration (tables sécurité, paramètres, journées, compteurs, audit + triggers)
- [ ] L0.4 Core : `errors.ts` (handler normalisé), `auth.ts` (JWT + refresh), `postes.ts`, `permissions.ts` (`perm`, `requireValidation`), `audit.ts`, `params.ts`, `numerotation.ts`, `journee.ts`, `realtime.ts`
- [ ] L0.5 Routes auth, setup, admin (users, postes, paramètres, audit, diagnostic)
- [ ] L0.6 Sauvegardes (horaire, manuelle, rétention, copie chiffrée, restauration planifiée)
- [ ] L0.7 Web : shell (layout, menu par rôle, en-tête avec date d'exploitation, mode sombre, taille du texte), client API (jetons, `X-Poste-Id`, 401 → refresh, 409, 428 → `ValidationDialog`), socket → invalidation TanStack Query, écrans Connexion/PIN, Verrouillage, Assistant, Utilisateurs, Postes, Paramètres, Journal d'audit, Sauvegardes, Diagnostic
- [ ] L0.8 Desktop : `setup.html` (serveur/client), serveur embarqué, tray, auto-lancement, découverte UDP, preload (`posteId`, impression, PDF, cache des présents), `offline.html`
- [ ] L0.9 electron-builder NSIS + `installer.nsh` (pare-feu, ProgramData) ; build `.exe` testé sur un Windows vierge
- [ ] L0.10 Seed `base` et `demo`
- [ ] L0.11 Verrouiller les middlewares : ajouter `"Edit(apps/server/src/core/auth.ts)"` et `"Edit(apps/server/src/core/errors.ts)"` dans `permissions.deny` de `.claude/settings.json`

**Terminé quand** : installateur fonctionnel ; serveur + 2 postes sur le même LAN ; approbation de poste ; connexion par mot de passe et PIN ; verrouillage ; validation responsable (428) ; sauvegarde/restauration testées ; journal d'audit non modifiable.

## L1 — Hébergement complet (≈ 6 sem.)
Specs : modules 03, 04, 05, 06, 07

- [ ] L1.1 Schéma : chambres, types, saisons, clients, entreprises, réservations, fiches de police, liste d'attente, groupes, jeux de règles, règles, prestations, folios, lignes, paiements, factures, file DGI
- [ ] L1.2 Tarifs et disponibilités (RG-01, §3) + tests
- [ ] L1.3 **Moteur d'imputation** + tests exhaustifs (exemple de référence du module 06)
- [ ] L1.4 Folios, paiements, cautions, factures (numérotation, empreinte, archive), avoirs + tests de concurrence
- [ ] L1.5 Réservations : création, modification (version), annulation (RG-04), changement de chambre, prolongation, walk-in, day-use, check-in (fiche de police, RG-09), pré-check-out et check-out (UC-07)
- [ ] L1.6 Groupes : bloc, chef, rooming list, règles (modèles, soumission, accord, signature, versions, simulation), confirmation, relevés, clôture du collectif
- [ ] L1.7 Clients (doublons, liste noire, pièce scannée), entreprises, comptes débiteurs, registre de police
- [ ] L1.8 Écrans : Planning (glisser-déposer), Réception, Réservation, Check-in, Check-out, Folio, Factures, Clients, Entreprises, Groupes (éditeur de règles), Chambres, Tarifs
- [ ] L1.9 Impressions : facture A4/PDF, fiche de police, relevé de folio, récapitulatif des règles

**Terminé quand** : scénarios de recette 2, 3, 4 et 6 (`TESTING.md`) verts.

## L2 — Exploitation (≈ 4 sem.) → **version pilote hébergement**
Spec : module 12 (+ rapports de base du 13)

- [ ] L2.1 Sessions de caisse (ouverture, mouvements, clôture à l'aveugle, écarts, validation, versement)
- [ ] L2.2 Main courante (non modifiable), consignes avec accusé de lecture
- [ ] L2.3 Audit de nuit 8 étapes + rapport journalier + changement de date + blocage des journées clôturées
- [ ] L2.4 Tableau de bord, liste des présents, rapport journalier
- [ ] L2.5 Écritures comptables générées à la clôture (version minimale, affinée en L6)

**Terminé quand** : scénarios 5, 7 et 8 verts ; 3 nuits d'exploitation simulées de bout en bout.

## L3 — Restaurant / bar et services annexes (≈ 6 sem.)
Specs : modules 08, 11

- [ ] L3.1 Paramétrage POS (points de vente, catégories, articles, tables)
- [ ] L3.2 Commandes, envoi cuisine/bar (bons), remises, offerts, division, annulations validées
- [ ] L3.3 Encaissement multi-modes + rendu, transfert sur chambre (imputation, RG-10, forfait PDJ), ticket Z
- [ ] L3.4 Écran de caisse tactile, écran cuisine optionnel, impressions 80 mm
- [ ] L3.5 Blanchisserie, transport (planning véhicules), salles de séminaire, prestations rapides, production du jour

**Terminé quand** : critères d'acceptation des modules 08 et 11 verts.

## L4 — Stocks et achats (≈ 5 sem.)
Spec : module 09

- [ ] L4.1 Articles, magasins, niveaux, mouvements, CMP
- [ ] L4.2 Fiches techniques branchées sur les ventes POS (RG-16)
- [ ] L4.3 Bons de commande, réceptions partielles, conversion d'unités
- [ ] L4.4 Inventaires (codes-barres), ajustements valorisés, alertes
- [ ] L4.5 Rapport marges restauration

## L5 — Étages et technique (≈ 3 sem.)
Spec : module 10

- [ ] L5.1 Plan des étages tactile, cycle d'entretien, plan du jour, affectation par crédits
- [ ] L5.2 Minibar, linge, divergences (branchées sur l'audit étape 3)
- [ ] L5.3 Maintenance (tickets, bloquant → hors service, préventive, historique)
- [ ] L5.4 Objets trouvés

## L6 — Comptabilité et fiscalité (≈ 4 sem.)
Spec : module 13

- [ ] L6.1 Correspondances comptables éditables, écritures complètes, contrôle d'équilibre
- [ ] L6.2 Journaux, balance âgée, états TVA et taxe de séjour
- [ ] L6.3 Exports CSV/Excel (format Sage paramétrable), clôture mensuelle
- [ ] L6.4 Tous les rapports + export PDF/Excel ; file DGI (interface de transmission)

## L7 — Recette et déploiement (≈ 4 sem.)
Specs : `TESTING.md`, `DEPLOYMENT.md`

- [ ] L7.1 HTTPS local (ADR-004), licence hors ligne, écran « mettre ce poste à jour »
- [ ] L7.2 Tests de charge 10 postes, base de 10 ans générée
- [ ] L7.3 Guides : installation, prise en main par rôle, aide contextuelle
- [ ] L7.4 Modèles d'import Excel livrés
- [ ] L7.5 Recette avec l'hôtel pilote (15 jours), corrections
- [ ] L7.6 Version 2.0.0 signée

**Terminé quand** : critères d'acceptation du CDC §9.3 remplis et validation écrite de l'hôtel pilote et de TIAF.
