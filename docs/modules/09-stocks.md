# Module 09 — Stocks et achats

**Lot** : L4 · **Dépend de** : 02 · **Dossier** : `modules/stocks/`, `web/features/stocks`

## Objectif
Connaître à tout moment le stock valorisé de chaque magasin, le coût matière de chaque plat et les écarts d'inventaire.

## Exigences
| ID | Exigence |
| --- | --- |
| EF-40 | Article de stock : code, libellé, catégorie, unité de consommation, unité d'achat, coefficient de conversion, stock minimum, fournisseur principal, code-barres, date de péremption |
| EF-41 | Magasins multiples (Économat central, Bar, Cuisine…) ; transferts internes tracés (sortie + entrée) |
| EF-42 | Fiches techniques : ingrédients × quantité par article vendu ; déduites à chaque vente POS |
| EF-43 | Achats : bon de commande (fournisseur, magasin, lignes quantité/prix) → réception totale ou partielle avec contrôle quantité et prix, n° de facture fournisseur ; statuts `COMMANDE → PARTIEL → RECU` |
| EF-44 | Sorties hors vente : perte, casse, consommation du personnel, produits d'accueil (hébergement) — motif obligatoire |
| EF-45 | Inventaire : photo théorique par magasin, saisie des quantités comptées (lecteur de codes-barres), validation → ajustements valorisés |
| EF-46 | Coût moyen pondéré ; alertes de stock minimum et de péremption (≤ 15 jours) |
| EF-47 | Rapports : ventes par article et période, coût matière et marge par plat, rotation, top/flop (module 13) |
| — | Journal des mouvements (type, quantité, coût, référence, utilisateur) non modifiable |

Types de mouvement : `STOCK_INITIAL`, `ENTREE`, `RECEPTION`, `SORTIE_VENTE`, `RETOUR_ANNULATION`, `PERTE`, `CASSE`, `PERSONNEL`, `HEBERGEMENT`, `TRANSFERT_SORTIE`, `TRANSFERT_ENTREE`, `INVENTAIRE`.

## Écrans
Articles (stock total, alerte) · Niveaux par magasin (valeur = quantité × CMP) · Mouvements (filtres) · Nouveau mouvement (entrée, sortie motivée, transfert) · Bons de commande + réception · Inventaires (saisie en tableau avec champ code-barres, écarts surlignés, validation) · Fiches techniques (depuis l'article POS : ingrédients, coût de revient calculé, marge théorique) · Alertes.

## Critères d'acceptation
- [ ] Stock 10 kg à 2 500 ; réception 10 kg à 3 000 → CMP 2 750.
- [ ] Réception d'1 sac de riz (unité d'achat « sac 25 kg », coefficient 25) à 16 250 → +25 kg à 650/kg.
- [ ] Réception partielle 6/10 → bon `PARTIEL` ; solde reçu → `RECU`.
- [ ] Vente d'un plat dont la fiche technique consomme 0,5 kg de poulet → mouvement `SORTIE_VENTE` −0,5 kg dans le magasin Cuisine.
- [ ] Inventaire : théorique 20, compté 18 → ajustement −2 valorisé au CMP, écart total affiché.
- [ ] Stock passant sous le minimum → notification au magasinier.
- [ ] Sortie « perte » sans motif → 400.
