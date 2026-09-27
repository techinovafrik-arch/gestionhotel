# Module 02 — Référentiel et paramètres

**Lot** : L0 (paramètres, assistant) puis enrichi à chaque lot · **Dépend de** : 01 · **Dossier** : `core/params.ts`, `modules/referentiel/`, `db/seed/`

## Objectif
L'hôtel configure lui-même tout ce qui varie d'un établissement à l'autre, sans intervention technique, dès l'installation.

## Exigences
| ID | Exigence |
| --- | --- |
| EF-P1 | Assistant de premier démarrage (`POST /setup`, uniquement si aucun utilisateur) : identité, fiscalité, compte ADMIN, option données de démonstration |
| EF-P2 | Paramètres éditables : `hotel`, `fiscal`, `politique`, `comptes`, `sauvegarde`, `happy_hour` (valeurs par défaut : `DATA_MODEL.md` §Paramètres) |
| EF-P3 | Catalogue de prestations (code, libellé, catégorie, service, prix TTC, TVA, compte comptable, coût fournisseur, sous-traitée) ; désactivation au lieu de suppression si utilisée |
| EF-P4 | Référentiel de base livré (seed `base`) : magasins (Économat, Bar, Cuisine), points de vente (REST, BAR), ~20 prestations courantes (minibar, blanchisserie, transport, séminaire, téléphone…) |
| EF-P5 | Données de démonstration (seed `demo`) : 4 types, 30 chambres sur 3 étages, 2 saisons, carte restaurant/bar avec fiches techniques, 17 articles de stock, 2 fournisseurs, tables, 2 véhicules, 2 salles, 2 entreprises, 5 clients, 10 comptes (un par rôle, mot de passe `hotel2026`, PIN distincts) |
| EF-P6 | Logo de l'hôtel (image ≤ 500 Ko en data URL) utilisé sur factures et tickets |
| — | Tous les taux fiscaux sont modifiables ; un changement de taux ne modifie jamais les lignes déjà postées |

## Écrans
- **Assistant** (plein écran, 4 étapes : Hôtel · Fiscalité · Administrateur · Démarrage) avec récapitulatif.
- **Administration › Paramètres** : onglets Hôtel, Fiscalité, Politique commerciale, Comptes comptables, Sauvegardes, Happy hour ; bouton « Enregistrer » par onglet ; aide sous chaque champ (règle RG concernée).
- **Tarifs › Prestations** : tableau filtrable par service, formulaire.

## Critères d'acceptation
- [ ] Base vide → l'application affiche l'assistant ; après validation, l'ADMIN est connecté et arrive sur le diagnostic.
- [ ] `/setup` rappelé ensuite → 409 `DEJA_INSTALLE`.
- [ ] Changer `politique.heure_checkout` à 11:00 → le pré-check-out propose un départ tardif dès 11:01.
- [ ] Changer `fiscal.tva_restauration` → les nouvelles lignes utilisent le nouveau taux ; les anciennes et les factures émises sont inchangées.
- [ ] Option démo cochée → 30 chambres, comptes par rôle opérationnels.
