---
description: Revue des changements en cours contre les invariants métier et les garde-fous du projet
---

Revue des changements non fusionnés (`git diff main...HEAD` et fichiers non commités).

Vérifie point par point, en citant fichier et ligne :

1. **Argent** : aucun `float`/`toFixed` pour un montant ; `splitTTC` utilisé ; entiers FCFA.
2. **Transactions** : toute écriture métier dans `db.transaction` ; pas d'`await` au milieu d'une transaction better-sqlite3.
3. **Imputation** : aucun `insert` direct dans `folio_lignes` hors `modules/facturation` ; toute charge sur un séjour passe par `imputer()`.
4. **Factures** : numéro via `nextNumber` dans la même transaction ; aucune mise à jour/suppression de facture.
5. **Journée** : dates métier = `dateExploitation()` ; aucune écriture sur une journée clôturée.
6. **Traçabilité** : `audit()` sur chaque action sensible ; paiements avec utilisateur, poste, session, date d'exploitation.
7. **Droits** : chaque route a `perm(module, niveau)` ; actions sensibles avec `requireValidation`.
8. **Concurrence** : `version` vérifiée sur rooms/reservations/folios.
9. **Temps réel** : `emit()` des bons topics après mutation.
10. **Garde-fous** : `core/auth.ts` et `core/errors.ts` non modifiés sans accord ; aucune dépendance native ajoutée ; aucun appel réseau sortant.
11. **Tests** : chaque RG/EF touché a un test nommé.
12. **Français** : messages d'erreur compréhensibles, citant la règle.

Rends un tableau : point · statut (OK / À corriger) · détail. Puis propose les corrections, sans les appliquer.
