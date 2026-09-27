# Module 06 — Groupes et répartition des charges

**Lot** : L1 · **Dépend de** : 05, 07 · **Dossier** : `modules/groupes/`, `web/features/groupes`

## Objectif
Gérer séminaires et groupes : bloc de chambres, chef de groupe, membres, et surtout **règles de répartition signées** qui décident automatiquement, pour chaque consommation, la part du groupe et celle du membre.

## Exigences
| ID | Exigence |
| --- | --- |
| EF-12 | Page et entrée de menu dédiées « Groupes » |
| EF-13 / RG-18 | Bloc de chambres par type (création : dates + [type, nombre, prix négocié]) ; disponibilité partielle signalée ; chambres non nominées libérées à la date limite (défaut J-7) |
| UC-02 | Création : entité (entreprise ou nom), chef de groupe (client existant ou nouveau, résident ou non), modèle de règles → groupe `EN_ATTENTE`, compte collectif ouvert, jeu v1 `BROUILLON`, acompte requis = Σ 1 nuitée par chambre |
| EF-14 | Rooming list importée d'Excel (nom, prénoms, téléphone, chambre facultative) ; création des clients inconnus ; rapport des lignes non placées |
| EF-15 | Compte collectif + un folio individuel par membre |
| EF-16 | Salles de séminaire et prestations associées (module 11), facturées au compte collectif |
| EF-88 | Modèles : Séminaire, Groupe touristique, Équipe sportive, Sans modèle |
| — | Règle = catégorie × bénéficiaires (`TOUS`/`LISTE`/`CHEF`) × mode (`TOTALE`, `POURCENTAGE`, `PLAFOND_JOUR`, `PLAFOND_SEJOUR`, `PLAFOND_GLOBAL`, `AUCUNE`) × valeur × validité (dates) × priorité |
| EF-89 | Récapitulatif imprimable en langage clair + exemple chiffré d'une journée type (`/jeux/:id/simulation`) |
| UC-03 / EF-90 | Cycle `BROUILLON → SOUMIS → VALIDE` ; validation = mode de signature (papier numérisé / tablette), chef signataire, agent, horodatage serveur, empreinte SHA-256 du contenu ; l'ancien `VALIDE` passe `REMPLACE` |
| EF-91 | Jeu soumis ou validé non modifiable ; modification = nouvelle version, applicable aux consommations postérieures |
| EF-92 | Groupe non confirmable (`CONFIRME`, niveau V) sans jeu validé ; règle hors politique → accord directeur avant signature |
| EF-93/94 | Moteur d'imputation (`BUSINESS_RULES.md` §4) ; réimputation manuelle validée |
| EF-95 à 98 | Origine affichée sur chaque ligne ; relevé quotidien du compte collectif par membre et catégorie avec consommation des plafonds ; relevé individuel ; historique des versions |
| EF-99 à 101 | Chaque membre règle sa part au départ ; compte collectif ouvert jusqu'au dernier départ, puis facturé (acompte déduit), réglé immédiatement ou sur compte débiteur |
| §21.2 | Membre qui quitte le groupe (détacher : charges futures au membre) · changement de chef tracé · plafond global atteint (alerte) · annulation partielle (libérer) · annulation totale (pénalité au collectif, validation) |

## Exemple de référence (test obligatoire)
Jeu « Séminaire » v1 validé : Hébergement TOTALE · Petit-déjeuner TOTALE · Déjeuner PLAFOND_JOUR 10 000 · Boissons alcoolisées AUCUNE · Minibar AUCUNE · Transport TOTALE · Blanchisserie TOTALE (CHEF).
- Déjeuner 12 500 d'un membre → 10 000 collectif (R3 v1) + 2 500 folio membre « (reliquat) ».
- 2ᵉ déjeuner le même jour, 8 000 → 0 collectif, 8 000 membre.
- Bière 2 000 transférée du bar → 2 000 membre.
- Blanchisserie du chef 5 000 → 5 000 collectif ; d'un membre → 5 000 membre.
- Nuitée postée par l'audit → 100 % collectif ; taxe de séjour → suit la règle Hébergement.

## Écrans
Liste des groupes (statut, dates, chambres, statut des règles) · Fiche groupe en onglets (voir `UI_UX.md` §6) · Éditeur de règles : tableau éditable (catégorie, bénéficiaires, mode, valeur, du, au, priorité), bouton « Charger un modèle », panneau « Simulation journée type », bouton « Soumettre », puis « Accord directeur » si hors politique, puis « Enregistrer la signature » (mode + fichier/scan facultatif), impression du récapitulatif à signer.

## Critères d'acceptation
- [ ] Création avec 10 STD demandées alors que 7 libres → 7 chambres en bloc + message « Disponibilité partielle : 3 × Chambre standard ».
- [ ] `PUT /jeux/:id` sur un jeu `SOUMIS` → 422 « créez une nouvelle version ».
- [ ] Jeu avec Minibar TOTALE → `hors_politique=1` ; signature refusée tant que le directeur n'a pas donné son accord.
- [ ] Confirmation sans jeu validé → 422 EF-92.
- [ ] Scénario de l'exemple de référence : montants exacts, `imputation_info` lisible, Σ parts = montant consommé.
- [ ] Nouvelle version validée en cours de séjour : les lignes antérieures gardent `jeu_version=1`, les nouvelles `jeu_version=2`.
- [ ] Départ du dernier membre → l'interface propose « Facturer le compte collectif » ; clôture avant le dernier départ → refus.

## Cas limites
Chef non résident (pas de réservation, mais signataire) · membre sans chambre nominée au check-in (refus : nominer d'abord) · plafond global partagé entre membres consommant simultanément (transactions sérialisées → pas de dépassement).
