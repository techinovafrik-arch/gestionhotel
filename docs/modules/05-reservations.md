# Module 05 — Réservations et séjour

**Lot** : L1 · **Dépend de** : 03, 04, 07 · **Dossier** : `modules/reservations/`, `web/features/reception`

## Objectif
Enchaîner sans ressaisie réservation → arrivée → séjour → départ, en respectant les règles de disponibilité, de tarif, de police et de caisse.

## Exigences
| ID | Exigence |
| --- | --- |
| R-01 | Création : client (existant ou nouveau en ligne), chambre ou type seul, dates, adultes/enfants, type de séjour, remise (RG-02, validation), petit-déjeuner inclus, entreprise, source, notes ; prix calculé (RG-01, remise entreprise) ; acompte requis (RG-03) ; folio individuel créé ; acompte encaissable immédiatement (reçu RA) |
| EF-17 | Walk-in en un seul écran : client + fiche de police + chambre libre et propre + tarif + caution → réservation `CHECKIN` directe |
| EF-18 | Changement de chambre (motif obligatoire, historique `room_changes`, recalcul optionnel du prix) ; en séjour : ancienne chambre `LIBRE`+`SALE`, nouvelle `OCCUPEE` (doit être libre et propre) |
| EF-19 | Prolongation (contrôle de disponibilité de la même chambre) ou départ anticipé |
| EF-20 | Liste d'attente quand complet (nom, téléphone, dates, type) ; conversion en réservation |
| EF-21 | Day-use : tarif `prix_dayuse`, facturé au check-in, pas de nuitée ni taxe de séjour |
| EF-22 | No-show traité par l'audit de nuit (module 12) |
| R-02 | Annulation : motif, pénalité RG-04 postée et facturée, annulation sans pénalité sur validation ; trop-perçu signalé pour remboursement |
| EF-78/79 | Check-in : fiche de police complète par occupant majeur (11 champs), sinon refus ; dérogation « sans pièce » uniquement avec validation directeur |
| RG-09 | Check-in refusé si chambre non `LIBRE` ou non `PROPRE`, ou date d'arrivée > date d'exploitation, ou chambre non attribuée, ou client non nominé |
| R-03 | Caution au check-in (montant + mode) enregistrée sur la session de caisse |
| UC-07 | Check-out guidé (`BUSINESS_RULES.md` §6) : pré-check-out (anomalies, supplément tardif proposé, relevé), paiements, facture automatique, caution, clôture |
| R-04 | Règlement sur compte entreprise (facturation différée) au check-out |
| R-05 | Liste des présents (évacuation) imprimable en un clic, disponible en mode dégradé |
| ENF-01 | Verrouillage optimiste sur la réservation |

## Statuts et transitions
```
EN_ATTENTE → CONFIRMEE → CHECKIN → CHECKOUT
BLOC → CONFIRMEE (nomination, groupe confirmé)
CONFIRMEE/EN_ATTENTE/BLOC → ANNULEE ;  CONFIRMEE → NO_SHOW (audit)
```

## Écrans
- **Réception (accueil)** : trois colonnes Arrivées du jour · Départs du jour · Présents ; actions en ligne (Check-in, Check-out, Folio) ; boutons Nouvelle réservation (F3), Walk-in (F4).
- **Nouvelle réservation** : `ClientPicker`, dates (nuits calculées), type/chambre (`RoomPicker` avec disponibilités et prix), remise, acompte (`PaymentForm`), récapitulatif du total estimé.
- **Fiche réservation** : en-tête statut + actions (Confirmer, Check-in, Changer de chambre, Prolonger, Annuler, Check-out), onglets Détails · Folio · Fiches de police · Historique.
- **Check-in**, **Check-out** : voir `UI_UX.md` §6.

## Critères d'acceptation
- [ ] Réservation 3 nuits STD 25 000, remise 10 % sans validation → 428 ; avec validation directeur → prix nuit 25 000, remise 10 %, acompte requis 25 000.
- [ ] Deux postes réservent la même chambre aux mêmes dates simultanément → une seule réussit.
- [ ] Check-in avec fiche sans « profession » → 400 « Fiche de police incomplète : profession ».
- [ ] Check-in d'une chambre `A_CONTROLER` → 422 RG-09.
- [ ] Annulation à J-2 → pénalité = 1 nuitée postée et facturée ; à J-5 → 0.
- [ ] Check-out à 13:30 → supplément demi-nuitée proposé ; à 19:00 → nuitée complète.
- [ ] Check-out avec solde 10 000 et 5 000 payés → refus « Solde restant à régler : 5 000 FCFA ».
- [ ] Check-out réussi → facture FA numérotée, folio `CLOTURE`, chambre `LIBRE`+`SALE`, tâche `DEPART` créée, notification gouvernante, caution restituée (mouvement de caisse négatif).
- [ ] Walk-in → réservation `CHECKIN`, fiche de police et caution enregistrées en une seule transaction.
- [ ] Day-use → ligne day-use au check-in, aucune nuitée postée par l'audit.

## Cas limites
Départ anticipé : date de départ ramenée à la date d'exploitation · client sans e-mail (facture imprimée) · changement de chambre vers une chambre d'un autre type sans recalcul · réservation sans chambre (attribution plus tard depuis le planning).
