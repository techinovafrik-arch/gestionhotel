# Stratégie de tests et recette

## 1. Pyramide

| Niveau | Outil | Cible |
| --- | --- | --- |
| Unitaires (fonctions pures) | Vitest | `money`, `dates`, tarifs, taxe de séjour, pénalités, moteur d'imputation, attendu de caisse, CMP |
| Intégration API | Vitest + supertest sur `start({ dataDir: tmp })` | Chaque endpoint critique, transactions, droits, 409/422/428 |
| E2E | Playwright sur l'interface servie par le serveur de test | Parcours de recette §3 |
| Charge | script k6 ou autocannon | 10 postes virtuels, §4 |

Couverture serveur ≥ **80 %** (priorité : facturation, imputation, numérotation, caisse, audit de nuit).

## 2. Règles d'écriture

- Chaque test crée une base temporaire (`mkdtemp`) avec le seed de base + fixtures du test ; aucun test ne dépend d'un autre.
- Nommer par exigence : `it('EF-25 numérotation continue sans trou en accès concurrent')`, `it('RG-04 pénalité 1 nuitée à J-2')`.
- Fabriques de données : `fixtures.ts` (`creerChambre`, `creerClient`, `creerReservationCheckin`, `ouvrirCaisse`, `creerGroupeConfirme(regles)`).
- Horloge : injecter `now()` et `dateExploitation()` (ne jamais dépendre de l'heure réelle ; tester 11:59 / 12:30 / 18:30 pour RG-06).
- Tests d'invariants après chaque scénario : `Σ lignes scindées = montant d'origine`, `Σ débits = Σ crédits`, numéros de facture consécutifs, aucune facture modifiée (empreinte).

## 3. Scénarios de recette prioritaires (E2E)

1. **Installation** : `/setup` → admin → approbation d'un second poste → connexion depuis ce poste.
2. **Cycle individuel** : réservation avec acompte Mobile Money → check-in (fiche de police, caution espèces) → commande restaurant transférée sur chambre → audit de nuit (nuitée + taxe postées) → check-out multi-modes → facture `FA-…-000001`, folio clôturé, chambre sale.
3. **Refus métier** : check-in sur chambre sale → message RG-09 ; fiche de police incomplète → refus ; remise sans validation → 428 → validation directeur → succès tracé.
4. **Groupe** : bloc de 10 chambres, rooming list importée, règles « séminaire » soumises, signées, groupe confirmé ; déjeuner 12 500 FCFA → 10 000 au collectif (R3 v1), 2 500 au membre ; deuxième déjeuner le même jour → 100 % membre ; départs ; facture du compte collectif acompte déduit.
5. **Caisse** : ouverture fond 50 000 ; ventes ; clôture à l'aveugle avec écart −3 000 → justification exigée → `A_VALIDER` → validation directeur ; ticket Z cohérent.
6. **Concurrence** : deux sessions modifient la même réservation → la seconde reçoit 409 ; 20 factures émises en parallèle → numéros 1 à 20 sans trou ni doublon.
7. **Coupure** : interruption du processus pendant un check-out (test d'intégration avec exception injectée) → aucune ligne, paiement ni facture partiels.
8. **Audit de nuit** : blocage étape 1 si une caisse est ouverte ; no-show avec pénalité prélevée sur l'acompte ; départ non effectué → check-out forcé → folio IMPAYE + main courante ; date d'exploitation +1 ; journée précédente non modifiable (ajout de ligne datée → refus).
9. **Comptabilité** : écritures d'une journée équilibrées ; état de TVA = somme des TVA des factures ; export CSV conforme.
10. **Sauvegarde / restauration** : sauvegarde manuelle, modification, restauration planifiée, redémarrage → données revenues à l'état sauvegardé en moins d'une heure.

## 4. Performance (avant chaque version majeure)

| Mesure | Cible |
| --- | --- |
| 10 postes virtuels, 1 requête/s chacun, 10 min | p95 < 1 s, 0 erreur |
| Vente POS complète (création → encaissement) | < 2 s |
| Propagation `change` rooms à 10 sockets | < 2 s |
| Rapport d'occupation sur 1 an (100 chambres, données générées) | < 10 s |
| Base de 10 ans générée (≈ 365 000 nuitées) | écrans courants toujours < 1 s |

## 5. Définition de « terminé » pour une fonctionnalité

- [ ] Critères d'acceptation de la spec du module vérifiés (test automatisé ou E2E).
- [ ] Tests unitaires/intégration verts, couverture du module ≥ 80 %.
- [ ] `pnpm lint && pnpm typecheck` sans erreur.
- [ ] Droits vérifiés (un rôle autorisé, un rôle refusé).
- [ ] Actions sensibles tracées dans `audit_log`.
- [ ] `emit()` des topics concernés, écran mis à jour sur un second poste.
- [ ] Messages d'erreur en français, compréhensibles.
- [ ] `.claude/state.md` mis à jour.
