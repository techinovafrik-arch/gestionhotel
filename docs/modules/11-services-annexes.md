# Module 11 — Services annexes (blanchisserie, transport, salles, prestations diverses)

**Lot** : L3 · **Dépend de** : 07 · **Dossier** : `modules/services/`, `web/features/services`

## Principe commun
Toute prestation annexe est une **prestation du catalogue** (code, libellé, catégorie, prix, TVA, compte) commandée, exécutée, puis postée au folio via `imputer` (client en séjour) ou payée immédiatement (client de passage : folio `PASSANT` + facture).

## Exigences
| ID | Exigence |
| --- | --- |
| EF-82 | Blanchisserie client : bon pièce par pièce (type de vêtement, quantité, prix unitaire), service normal ou express (× 1,5 paramétrable), statuts `COLLECTE → EN_TRAITEMENT → LIVRE` (ou `ANNULE`), réclamation (perte, dommage) ; imputation au folio à la livraison |
| EF-83 | Transport : transfert (aéroport, gare, ville) ou mise à disposition (durée), date/heure, lieu de prise en charge, destination, passagers, véhicule, chauffeur, tarif forfaitaire ou horaire ; statuts `RESERVE → AFFECTE → EFFECTUE` ou `ANNULE` ; imputation à `EFFECTUE` |
| EF-84 | Planning des véhicules : refus d'une double affectation d'un véhicule sur un créneau qui se chevauche (durée par défaut 1 h 30) |
| EF-85 | Prestations sous-traitées (pressing externe, excursion, location de voiture) : prix de vente, coût fournisseur, marge dans les rapports |
| EF-86 | Prestations ponctuelles à la réception (téléphone, impression, salle de sport, garde d'enfants) : sur une chambre (`imputer`) ou vente directe payée |
| EF-87 | État de production du jour par service et rapport de CA |
| EF-16 | Salles de séminaire (capacité, tarif journée/demi-journée) ; réservation par date et formule avec contrôle de chevauchement ; facturation au compte collectif du groupe ou à un folio |

## Écrans
Blanchisserie (bons du jour par statut, nouveau bon avec grille de vêtements, livraison) · Transport (planning par véhicule sur la journée, liste, nouveau transport) · Véhicules · Salles et réservations de salles (calendrier) · « Prestation rapide » à la réception (catalogue + chambre ou paiement direct) · Production du jour.

## Critères d'acceptation
- [ ] Bon express 2 chemises (1 500) + 1 costume (5 000) → 12 000 ; à la livraison, ligne BLANCHISSERIE sur le folio de la chambre, bon marqué facturé (pas de double facturation si re-livré).
- [ ] Minibus affecté 10:00–11:30 ; nouvelle affectation à 11:00 → refus ; à 11:45 → accepté.
- [ ] Transfert aéroport « effectué » pour un membre de groupe séminaire → 100 % au compte collectif (règle Transport TOTALE).
- [ ] Vente directe « Impression » 10 pages sans chambre, payée en espèces → folio PASSANT, facture, folio clôturé.
- [ ] Salle Baobab réservée en journée le 12/03 ; demi-journée le même jour → refus.
