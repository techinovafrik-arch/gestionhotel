# Module 08 — Restaurant / bar (caisse POS)

**Lot** : L3 · **Dépend de** : 07, 09, 12 (sessions de caisse) · **Dossier** : `modules/restaurant/`, `web/features/pos`

## Objectif
Chaque point de vente devient une caisse autonome reliée aux folios et au stock : toute vente est payée sur place ou transférée sur la chambre, et décrémente le stock.

## Exigences
| ID | Exigence |
| --- | --- |
| EF-31 | Écran tactile : catégories colorées, articles, quantités, commentaires (cuisson, sans piment), plan de salle par point de vente |
| EF-32 | Aucune commande ni vente sans session de caisse ouverte de l'agent pour ce point de vente |
| EF-33 | « Envoyer » : lignes non envoyées regroupées par zone (CUISINE / BAR) → bon imprimé sur l'imprimante de la zone + événement `bon_preparation` |
| EF-34 | Addition, division (déplacer des lignes/quantités vers une nouvelle commande), remise plafonnée par rôle (caissier 0 %, niveau V 50 %), offert (ligne ou commande) avec motif et validation |
| EF-35 | Encaissement multi-modes avec calcul du rendu (espèces seules) ; transfert sur chambre uniquement si client en séjour, ticket de transfert à signer, contrôle RG-10 |
| EF-36/RG-15 | Annulation d'un article envoyé ou d'un ticket encaissé (journée en cours) : motif + validation, stock réintégré, paiements annulés |
| EF-37 | Petit-déjeuner inclus au forfait : articles `inclus_forfait_pdj` à 0 lors du transfert si la réservation a `petit_dejeuner_inclus` |
| EF-38 | Prix happy hour (`prix_happy`) sur la plage `happy_hour` ; prix par point de vente via catégories affectées aux points de vente |
| EF-39 | Clôture de session (module 12) + ticket Z : ventes par statut, encaissements par mode/opérateur, articles vendus, annulations, offerts |
| RG-16 | Stock négatif : alerte ; blocage si l'article le demande |
| — | Paramétrage : points de vente, catégories, articles (catégorie de facturation, TVA, zone, code-barres, article de stock lié), tables |
| — | Lecteur de codes-barres : scan = ajout de l'article |
| — | Ventes payées postées sur le folio technique `POS` du point de vente (ADR-007) ; numéro de ticket par série `T<CODE>` |

## Statuts
`OUVERTE → PAYEE | TRANSFEREE | OFFERTE | ANNULEE`

## Écrans
- **Caisse POS** (plein écran, tactile, voir `UI_UX.md` §6) : sélection du point de vente, plan de salle (tables libres/occupées avec montant), commandes ouvertes, grille articles, ticket, actions.
- **Encaissement** : total en très grand, boutons de billets rapides (1 000, 2 000, 5 000, 10 000), modes, rendu affiché en grand ; impression du ticket et ouverture du tiroir si espèces.
- **Transfert sur chambre** : liste des chambres occupées (numéro + nom), détail de la répartition renvoyée par le serveur (part groupe / part membre), impression du ticket à signer.
- **Paramétrage** : points de vente, catégories (couleur, ordre), articles (+ fiche technique), tables.
- **Écran cuisine** (optionnel, tablette) : bons reçus en temps réel, bouton « Prêt ».

## Critères d'acceptation
- [ ] Caissier sans session ouverte → création de commande refusée « Ouvrez votre caisse ».
- [ ] Commande 2 × Poulet braisé (7 500) + 1 bière (2 000) = 17 000 ; espèces 20 000 → rendu 3 000, ticket `TREST-…-000001`, tiroir ouvert, stock : poulet −1 kg, attiéké −0,6 kg, bière −1.
- [ ] Carte 20 000 pour 17 000 → refus « seules les espèces rendent la monnaie ».
- [ ] Transfert chambre 214 (client membre d'un groupe séminaire) d'un déjeuner 12 500 → réponse détaillant 10 000 groupe / 2 500 membre ; lignes visibles dans les deux folios.
- [ ] Transfert vers une chambre libre → refus « encaissement immédiat requis ».
- [ ] Solde 95 000 + transfert 10 000 avec plafond 100 000 → 428 plafond dépassé.
- [ ] Remise 10 % par un caissier → 428 ; par le responsable → acceptée, tracée.
- [ ] Annulation d'un plat envoyé en cuisine sans validation → 428.
- [ ] Ticket Z : Σ encaissements par mode = paiements de la session.

## Cas limites
Division d'une ligne de quantité 3 en 1 + 2 · happy hour qui commence pendant une commande (prix fixé à l'ajout de la ligne) · commande restée ouverte à la clôture de caisse (signalée ; bloque l'audit de nuit).
