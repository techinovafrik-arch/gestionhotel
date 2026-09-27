# Module 03 — Hébergement (chambres, tarifs, planning)

**Lot** : L1 · **Dépend de** : 02 · **Dossier** : `modules/hebergement/`, `web/features/planning`, `web/features/chambres`

## Objectif
Donner à la réception une vision exacte et temps réel de chaque chambre et un planning graphique pour vendre sans erreur.

## Exigences
| ID | Exigence |
| --- | --- |
| EF-05 | Planning chambres × jours (14/30/60 j), couleur par statut, création par clic sur case vide, déplacement par glisser-déposer contrôlé par le serveur |
| EF-06 | États indépendants commercial (`LIBRE`, `OCCUPEE`, `HORS_SERVICE`) et entretien (`PROPRE`, `SALE`, `EN_COURS`, `A_CONTROLER`), propagés en < 2 s |
| EF-07 | Caractéristiques de chambre (liste libre : Climatisation, Vue piscine, Accessible PMR, Lit bébé possible…) filtrables dans la recherche de disponibilité |
| EF-C1 | Import Excel des chambres (colonnes : numero, type, etage, prix, caracteristiques séparées par des virgules) ; types créés si absents ; doublons ignorés ; rapport |
| RG-01 | Tarif = prix de base × (1 + majoration saison) ; prix day-use propre au type |
| — | Types de chambre : code, libellé, prix de base, prix day-use, capacité, remise max |
| — | Saisons : libellé, dates, majoration % |
| — | Mise hors service manuelle avec motif et date de retour prévue ; remise en service |
| — | Disponibilités : `GET /disponibilites` (règles `BUSINESS_RULES.md` §3) |

## Entités
`room_types`, `saisons`, `rooms` (+ `version`), `room_changes`.

## Écrans
- **Planning** (voir `UI_UX.md` §6) : légende des couleurs, navigation ◀ ▶ par semaine, bouton « Aujourd'hui », filtres type/étage, infobulle réservation (client, dates, statut, solde), colonne des réservations non attribuées glissables vers une chambre.
- **Chambres** : grille ou liste, filtres, fiche (type, étage, caractéristiques, crédits de ménage, minibar oui/non, historique).
- **Tarifs** : types de chambre, saisons, simulateur de prix (type + date → prix).

## Critères d'acceptation
- [ ] Glisser une réservation vers une chambre occupée à ces dates → retour en place + message « Chambre 204 occupée sur cette période (R-2027-00012) ».
- [ ] Déplacer une réservation dans le passé → refus.
- [ ] Type 25 000 FCFA, saison +20 % couvrant l'arrivée → prix nuit 30 000.
- [ ] Chambre passée hors service sur un poste → grisée sur le planning d'un autre poste en < 2 s, exclue des disponibilités jusqu'à `hs_retour`.
- [ ] Recherche « Vue piscine » → seules les chambres ayant cette caractéristique.
- [ ] Import de 30 lignes dont 2 doublons → 28 chambres créées, rapport affiché.

## Cas limites
Réservation à cheval sur deux saisons (RG-01 : saison de la date d'arrivée) · modification du type d'une chambre ayant des réservations futures (autorisée, prix des réservations existantes inchangé) · 100 chambres × 60 jours (rendu < 1 s : virtualiser les lignes).
