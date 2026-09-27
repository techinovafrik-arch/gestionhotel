# Règles de gestion et algorithmes

Toutes les valeurs chiffrées sont des **paramètres** (`parametres`) modifiables par l'ADMIN ; les valeurs indiquées sont les valeurs livrées par défaut. Chaque règle doit avoir au moins un test automatisé nommé avec son identifiant (`it('RG-04 …')`).

## 1. Règles de gestion

| Réf. | Règle | Défaut |
| --- | --- | --- |
| RG-01 | Prix par nuit = prix de base du type × (1 + majoration de la saison couvrant la date d'arrivée ; la plus forte si plusieurs). Total = prix par nuit × nuits × (1 − remise %) | — |
| RG-02 | Remise ≤ `room_types.remise_max` ; toute remise > 0 exige la validation d'un ADMIN ou DIRECTEUR | 20 % |
| RG-03 | Acompte exigé à la réservation individuelle = une nuitée sans remise | 1 nuitée |
| RG-04 | Pénalité d'annulation : J-3 et plus → 0 ; J-2 et J-1 → 1 nuitée ; jour J → 2 nuitées ; après check-in → totalité du séjour | — |
| RG-05 | Clôture d'un folio impossible si solde ≠ 0 ou caution détenue, sauf clôture forcée validée et tracée | — |
| RG-06 | Départ après l'heure limite → supplément : demi-nuitée jusqu'à 18 h, nuitée complète après | 12 h / 18 h |
| RG-07 | Heure d'arrivée standard ; arrivée anticipée facturée si la chambre était vendue la nuit précédente | 14 h |
| RG-08 | Client attendu non arrivé à l'audit de nuit = no-show ; pénalité (n nuitées) prélevée sur l'acompte | audit 2 h, 1 nuitée |
| RG-09 | Une chambre n'est vendable (check-in) que si **libre** commercialement **et propre** | — |
| RG-10 | Transfert sur chambre autorisé si client en séjour et solde + part membre ≤ plafond = max(plafond folio, caution détenue) ; sinon validation d'un responsable | 100 000 FCFA |
| RG-11 | Nuitée et taxe de séjour postées une seule fois par nuit et par chambre, par l'audit de nuit uniquement | — |
| RG-12 | Facture émise jamais modifiée ni supprimée ; annulation par avoir (total), puis nouvelle facture | — |
| RG-13 | Numérotation des factures unique, continue, annuelle | `FA-2027-000001` |
| RG-14 | Écart de caisse > seuil (par mode de paiement) → justification obligatoire + validation du directeur | 2 000 FCFA |
| RG-15 | Annulation d'un article déjà envoyé en cuisine → motif + validation d'un responsable | — |
| RG-16 | Vente POS rendant un stock négatif → alerte ; blocage si `pos_articles.bloquer_stock_negatif` | alerte |
| RG-17 | Journée d'exploitation clôturée non modifiable ; corrections par régularisation sur la journée en cours | — |
| RG-18 | Chambres de bloc non nominées remises en vente à la date limite (`groupes.date_limite_bloc`) | J-7 |
| RG-19 | Objet trouvé non réclamé → destruction ou don | 90 jours |

## 2. Montants, TVA et taxes

```ts
// packages/shared/money.ts — prix saisis TTC (paramètre fiscal.prix_ttc = true)
export function splitTTC(ttc: number, tauxPct: number) {
  const ht = Math.round((ttc * 100) / (100 + tauxPct));
  return { ht, tva: ttc - ht };            // ht + tva === ttc, toujours
}
```

Taux par catégorie : `HEBERGEMENT` → `fiscal.tva_hebergement` ; `PETIT_DEJEUNER, DEJEUNER, DINER, BOISSONS, BOISSONS_ALCOOL, MINIBAR` → `fiscal.tva_restauration` ; autres → `fiscal.tva_services` ; `TAXE_SEJOUR` → 0.

Taxe de séjour (par nuit, par chambre occupée) :

| Mode | Calcul |
| --- | --- |
| `PAR_PERSONNE_NUIT` | montant × (adultes + (exo_enfants ? 0 : enfants)) |
| `POURCENTAGE` | round(prix net de la nuit × pct / 100) |
| `FORFAIT_CHAMBRE` | montant |
| Exonération (`reservations.exoneration_taxe`) ou day-use | 0 |

La taxe est une ligne distincte (`est_taxe_sejour=1`, catégorie `TAXE_SEJOUR`, TVA 0), jamais incluse dans le HT.

## 3. Disponibilité d'une chambre

Réservations « actives » : statut ∈ `CONFIRMEE, CHECKIN, EN_ATTENTE, BLOC`.

- Séjour à la nuitée [A, D) : conflit avec toute nuitée active où `arrivee < D ET depart > A`, et tout day-use actif dont la date ∈ [A, D).
- Day-use à la date A : conflit avec toute nuitée couvrant la nuit A (`arrivee ≤ A < depart`), tout day-use le même jour, tout séjour `CHECKIN` dont le départ est A (client pas encore parti).
- Chambre `HORS_SERVICE` exclue si `hs_retour` absent ou > A.
- Surréservation : une réservation sans chambre attribuée est acceptée seulement si le nombre de réservations non attribuées du type ≤ `floor(nb chambres du type × surreservation_pct / 100)` (0 % par défaut = interdit).

## 4. Moteur d'imputation (cœur de la facturation)

Point d'entrée unique pour **toute** charge sur un séjour (audit de nuit, POS, minibar, blanchisserie, transport, prestations, départ tardif) :

```ts
imputer(req, reservationId, charge: { designation, categorie, montant_ttc, quantite?, prix_unitaire?, taux_tva?,
        origine, origine_ref?, service?, date_exploitation? }): { lignes: number[], repartition: {groupe, membre}, info? }
```

Algorithme (déterministe et rejouable — EF-93) :

```
resa     ← réservation ; folioInd ← folio INDIVIDUEL de la réservation
date     ← charge.date_exploitation ?? dateExploitation()
SI resa.groupe_id est nul OU groupe.statut ∉ {CONFIRME, EN_COURS} OU aucun jeu VALIDE
    → une ligne sur folioInd ; FIN
jeu      ← jeu_regles VALIDE du groupe (version en vigueur maintenant)
catRegle ← (charge.categorie == TAXE_SEJOUR) ? HEBERGEMENT : charge.categorie
regles   ← règles du jeu pour catRegle, triées par priorité puis id, filtrées :
             date ∈ [date_debut, date_fin] (bornes facultatives)
             beneficiaires = TOUS | (CHEF et client = chef du groupe) | (LISTE et client ∈ beneficiaires_ids)
reste ← montant ; parts ← []
POUR r DANS regles, tant que reste > 0 :
    SI r.mode = AUCUNE : ARRÊTER
    s ← selon r.mode :
        TOTALE          : reste
        POURCENTAGE     : min(reste, round(montant × r.valeur / 100))
        PLAFOND_JOUR    : min(reste, max(0, r.valeur − Σ lignes(regle_id=r, reservation=resa, date=date)))
        PLAFOND_SEJOUR  : min(reste, max(0, r.valeur − Σ lignes(regle_id=r, reservation=resa)))
        PLAFOND_GLOBAL  : min(reste, max(0, r.valeur − Σ lignes(regle_id=r)))   (+ alerte si atteint)
    SI s > 0 : parts.push({r, s}) ; reste −= s
SI parts vide → une ligne sur folioInd ; FIN
collectif ← folio COLLECTIF ouvert du groupe
Pour chaque part : ligne sur collectif (regle_id, regle_code, jeu_version, montant_origine = montant,
                   ligne_origine_id = id de la 1re ligne créée, imputation_info)
Si reste > 0 : ligne « (reliquat) » sur folioInd (montant = reste, ligne_origine_id = 1re ligne)
imputation_info = « Déjeuner 12 500 FCFA — 10 000 FCFA au groupe (règle R3, version 2), 2 500 FCFA au membre »
emit('folios')
```

Règles associées :
- Une nouvelle version validée s'applique **aux seules consommations postérieures** à sa validation ; pas de réimputation rétroactive automatique.
- Réimputation manuelle (EF-94) : annule la ligne source (motif « Transférée vers FO-… ») et recrée la ligne sur le folio cible avec `origine=TRANSFERT`, `ligne_origine_id` = source. Validation d'un responsable obligatoire si l'un des folios est `COLLECTIF`.
- Règle « hors politique » (validation directeur avant signature) : `TOTALE` ou `POURCENTAGE ≥ 100` sur `BOISSONS_ALCOOL`, `MINIBAR` ou `TELEPHONE`.

## 5. Solde d'un folio

```
charges    = Σ montant_ttc des lignes non annulées
paiements  = Σ montant des paiements VALIDE non caution (les remboursements sont des montants négatifs)
solde      = charges − paiements
caution    = Σ paiements caution VALIDE avec caution_statut = DETENUE (hors solde, hors CA)
en_attente = Σ Mobile Money EN_ATTENTE (non comptés dans le solde)
```

## 6. Check-out (UC-07) — transaction unique

1. Réservation `CHECKIN`, folio non `LITIGE`, aucun ticket POS `OUVERT` sur la chambre (sinon refus, sauf check-out forcé).
2. Supplément de départ tardif proposé selon l'heure serveur (RG-06), posté via `imputer`.
3. Caution : `CONVERTIR` (devient paiement) ou `RESTITUER` (mouvement de caisse négatif).
4. Paiements saisis (multi-modes, multi-payeurs) → `encaisser` (session de caisse ouverte obligatoire, sauf `COMPTE_DEBITEUR`).
5. Solde > 0 et règlement `DEBITEUR` → paiement `COMPTE_DEBITEUR` sur le folio + ligne « Report folio … » sur le folio `DEBITEUR` de l'entreprise.
6. Solde > 0 restant → refus (sauf check-out forcé → folio `IMPAYE`). Solde < 0 → refus « trop-perçu : rembourser » (sauf forcé). Mobile Money en attente → refus.
7. Facture finale générée (lignes non annulées et non facturées, regroupées par famille).
8. Folio `CLOTURE` (ou `IMPAYE`), réservation `CHECKOUT` (départ ramené à la date d'exploitation si anticipé), chambre `LIBRE` + `SALE`, tâche de nettoyage `DEPART`, notification gouvernante.
9. Membre de groupe : si plus aucun membre `CHECKIN`/`CONFIRMEE` → signaler « dernier membre : facturer le compte collectif ».

## 7. Facture et avoir

- Génération : lignes du folio `annulee=0 AND facture_id IS NULL` ; contenu figé en JSON (hôtel, client, familles avec HT/TVA/TTC, taxe de séjour, paiements, net à payer) ; `empreinte = SHA-256(contenu)` ; copie JSON dans `archives-factures/<numero>.json` ; entrée `file_dgi`.
- Client facturé : entreprise du folio si présente (raison sociale, adresse, compte contribuable), sinon client, sinon titulaire.
- Mentions obligatoires (EF-71) : identité, compte contribuable et régime de l'hôtel, numéro, date, client, détail HT/TVA/taxe/TTC, modes de paiement.
- Avoir : uniquement sur une `FA` non déjà annulée ; montants négatifs ; motif et validation responsable ; libère les lignes (`facture_id=NULL`) et rouvre le folio pour correction puis nouvelle facture.

## 8. Caisse (EF-65 à EF-68)

```
attendu[mode] = (mode = ESPECES ? fond_initial : 0)
              + Σ paiements VALIDE de la session pour ce mode (hors COMPTE_DEBITEUR, AVOIR ; cautions incluses)
              + Σ mouvements_caisse de la session pour ce mode (restitutions de caution < 0, entrées/sorties diverses)
ecart[mode]   = compte[mode] − attendu[mode]
```

- Comptage **à l'aveugle** : l'agent saisit ce qu'il compte avant de voir l'attendu ; l'attendu n'est renvoyé qu'après la clôture (sauf niveau V).
- Un écart |e| > seuil sur un mode → la première tentative renvoie `besoin_justification` ; avec justification → session `A_VALIDER` + notification du directeur ; sinon `CLOTUREE`.
- Une seule session ouverte par utilisateur ; aucune vente POS ni encaissement réception sans session ouverte.

## 9. Audit de nuit (8 étapes bloquantes)

| Étape | Action | Blocage |
| --- | --- | --- |
| 1 Contrôle préalable | Vérifier sessions de caisse et commandes POS | Toute session ouverte (y compris celle de l'auditeur) ou commande ouverte |
| 2 No-shows | Pour chaque `CONFIRMEE` avec arrivée ≤ date : no-show (pénalité RG-08, facture, folio clôturé ou impayé), report (+1 jour si la chambre est libre) ou no-show sans pénalité (validation). Libération des blocs échus (RG-18) | — |
| 3 Départs et divergences | Chaque `CHECKIN` avec départ ≤ date : prolonger 1 nuit (si chambre libre) ou check-out forcé (caution convertie, solde en impayé, entrée main courante). Day-use restants clôturés. Divergences housekeeping à confirmer | Décision manquante, divergence non confirmée |
| 4 Report des nuitées | `posterNuitee` pour chaque `CHECKIN` (hors day-use) : nuitée nette + taxe de séjour, via `imputer`, idempotent | — |
| 5 Contrôle des soldes | Liste des folios au-delà du plafond ou de la caution | Accusé de lecture |
| 6 Rapports | Rapport journalier figé dans `journees.rapport` (occupation, ADR, RevPAR, CA par service, encaissements, arrivées, départs, no-shows, présents, écarts) | — |
| 7 Sauvegarde | `db.backup()` complète | Échec → alerte ADMIN, étape non validée |
| 8 Changement de date | Écritures comptables de la journée, journée `CLOTUREE`, nouvelle journée `OUVERTE` (date + 1), notification à tous les postes | — |

## 10. Restaurant / bar

- Prix courant = `prix_happy` si happy hour active et l'heure serveur ∈ [début, fin], sinon `prix`.
- Total commande = Σ (quantité × prix) des lignes non annulées, non offertes, non incluses au forfait, × (1 − remise %).
- Remise : plafond 0 % pour un caissier, 50 % pour un niveau V ; au-delà → validation.
- Transfert sur chambre : forfait petit-déjeuner inclus → lignes `inclus_forfait_pdj` à 0 ; regroupement par `categorie_facturation` ; chaque groupe passe par `imputer` ; contrôle RG-10 sur la part membre estimée.
- Encaissement : Σ reçu ≥ total ; seules les espèces rendent la monnaie ; lignes de vente postées sur le folio technique `POS` du point de vente (base des écritures) ; ticket numéroté par série du point de vente.
- Stock : fiche technique (ingrédients × quantité vendue) sinon article de stock lié (1 pour 1), sortie du magasin du point de vente.

## 11. Stocks

- Coût moyen pondéré à chaque entrée : `cmp = (stock_total × cmp + q × coût) / (stock_total + q)`.
- Réception : quantité en unité d'achat × `coefficient` = unité de consommation ; coût unitaire / coefficient.
- Inventaire : photo théorique à l'ouverture ; à la validation, ajustement = compté − stock **actuel** (les ventes pendant l'inventaire sont prises en compte), valorisé au CMP.

## 12. Housekeeping

- Passage à `PROPRE` réservé à GOUVERNANTE, DIRECTEUR, ADMIN.
- Plan du jour : départs (2 crédits, priorité si arrivée le même jour), recouches (1), chambres sales (2), arrivées (priorité haute).
- Affectation : tâche suivante (priorité décroissante, étage, numéro) donnée à l'employée ayant le moins de crédits cumulés.
- Divergence : constat `VIDE` sur chambre `OCCUPEE`, ou `OCCUPEE` sur chambre `LIBRE`.

## 13. Écritures comptables (clôture de journée)

| Flux | Débit | Crédit |
| --- | --- | --- |
| Ventes du jour (hors transferts et reports débiteurs) | 411100 Clients (TTC) | 706xxx par catégorie (HT), 443100 TVA, 447100 Taxe de séjour |
| Encaissements par mode | 571100 / 521100 / 513000 / 585000 | 411100 |
| Transfert vers compte débiteur | 411200 Débiteurs | 411100 |
| Cautions reçues | 571100 | 419100 |
| Cautions restituées ou converties | 419100 | 571100 |

Contrôle : Σ débits = Σ crédits pour chaque journée (test obligatoire).
