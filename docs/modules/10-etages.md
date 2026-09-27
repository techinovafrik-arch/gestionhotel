# Module 10 — Étages (housekeeping, minibar, linge, maintenance, objets trouvés)

**Lot** : L5 (états de chambre dès L1) · **Dépend de** : 03, 07 · **Dossier** : `modules/etages/`, `web/features/etages`

## Objectif
Une chambre n'est proposée à la vente qu'une fois nettoyée **et** contrôlée ; pannes et objets trouvés sont suivis jusqu'au bout.

## Exigences — Housekeeping
| ID | Exigence |
| --- | --- |
| EF-48 | Plan de travail généré chaque matin : départs, recouches, chambres sales, arrivées prioritaires |
| EF-49 | Affectation équilibrée par crédits (départ 2, recouche 1) entre les femmes de chambre saisies |
| EF-50 | Cycle `SALE → EN_COURS → A_CONTROLER → PROPRE` ; `PROPRE` réservé à la gouvernante (et direction/admin) ; notification « chambre prête » à la réception |
| EF-51 | Saisie sur tablette Wi-Fi (interface tactile), mise à jour instantanée à la réception |
| EF-52 | Relevé minibar par chambre (articles du catalogue catégorie MINIBAR) → `imputer` sur le séjour |
| EF-53 | Linge : sorties vers blanchisserie, retours, pertes ; stock « en blanchisserie » par article |
| EF-54 | Constat d'étage (occupée / vide) ; rapport de divergence avec l'état réception, à traiter avant l'audit de nuit |

## Exigences — Maintenance
| ID | Exigence |
| --- | --- |
| EF-55 | Ticket créé par tout utilisateur autorisé : chambre ou zone/équipement, catégorie (plomberie, électricité, climatisation, menuiserie, informatique, autre), priorité (NORMALE, HAUTE, URGENTE), photo, description |
| EF-56 | Cycle `OUVERT → AFFECTE → EN_COURS → RESOLU → VERIFIE`, délais mesurés |
| EF-57 | Ticket bloquant → chambre `HORS_SERVICE` (sauf si occupée) avec date de retour ; réservations impactées listées à la réception ; à `VERIFIE` → chambre `LIBRE` + `A_CONTROLER` |
| EF-58 | Maintenance préventive (libellé, équipement, fréquence en jours, prochaine date) avec rappels ; « Fait » recalcule la prochaine date |
| EF-59 | Historique et coût des pièces par chambre/équipement, délai moyen de résolution |

## Exigences — Objets trouvés
| ID | Exigence |
| --- | --- |
| EF-60 | Enregistrement : description, lieu, date, trouveur, photo, lieu de stockage, client présumé |
| EF-61 / RG-19 | Restitution (identité + pièce du récupérant obligatoires), destruction ou don ; objets échus (90 j) signalés |

## Écrans
Plan des étages (grille de chambres colorées, tap → changer l'état, constat, minibar, signaler une panne) · Plan du jour (tâches par employée, crédits, bouton « Générer », « Affecter ») · Divergences · Linge · Tickets (kanban par statut ou liste triée par priorité) · Préventive (échéancier) · Objets trouvés (liste, échus en rouge, restitution).

## Critères d'acceptation
- [ ] Une réceptionniste tente de passer une chambre à `PROPRE` → 403 ; la gouvernante → OK, notification réception, chambre vendable.
- [ ] Plan généré avec 4 départs, 10 recouches ; 2 employées → charges 9 et 9 crédits.
- [ ] Relevé minibar 2 eaux + 1 bière sur la chambre 105 occupée → lignes MINIBAR sur son folio (ou part groupe/membre selon règles).
- [ ] Ticket bloquant sur la 204 libre → chambre hors service, grisée sur le planning ; ticket vérifié → `LIBRE` + `A_CONTROLER`.
- [ ] Restitution sans pièce du récupérant → 400.
- [ ] Constat « vide » sur une chambre `OCCUPEE` → apparaît dans les divergences et bloque l'étape 3 de l'audit tant qu'elle n'est pas confirmée.
