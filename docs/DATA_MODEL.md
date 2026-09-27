# Modèle de données

Base SQLite unique (`hotel.db`), ouverte **uniquement** par le processus serveur. Le DDL ci-dessous est la **référence** : l'implémentation se fait en schémas Drizzle (`apps/server/src/db/schema/*.ts`) qui doivent produire exactement ces tables, contraintes, index et triggers (les triggers et index partiels vont dans une migration SQL écrite à la main).

## Principes

- Montants : `INTEGER` en FCFA. Quantités de stock : `REAL`.
- Dates métier : `TEXT` ISO `YYYY-MM-DD` ; horodatages : `TEXT` `YYYY-MM-DD HH:MM:SS` heure locale du serveur.
- Booléens : `INTEGER` 0/1. Listes : `TEXT` JSON (caractéristiques de chambre, bénéficiaires d'une règle).
- `version INTEGER` sur les enregistrements soumis au verrouillage optimiste (`rooms`, `reservations`, `folios`, `groupes`).
- Aucune suppression physique sur : `factures`, `audit_log`, `main_courante` (triggers), `paiements`, `folio_lignes` (annulation logique `annulee=1` + motif).
- Toute ligne financière porte `date_exploitation`, `user_id`, `poste_id` (et `session_id` pour les paiements).

## Carte des entités (≈ 60 tables)

| Domaine | Tables |
| --- | --- |
| Sécurité | `users`, `postes`, `refresh_tokens`, `audit_log`, `parametres` |
| Hébergement | `room_types`, `saisons`, `rooms`, `room_changes` |
| Clientèle | `clients`, `entreprises`, `fiches_police`, `liste_attente` |
| Réservations / groupes | `reservations`, `groupes`, `groupe_chefs_hist`, `jeux_regles`, `regles` |
| Facturation | `prestations`, `folios`, `folio_lignes`, `paiements`, `factures`, `compteurs`, `file_dgi` |
| Caisse | `sessions_caisse`, `mouvements_caisse` |
| Restaurant / bar | `points_vente`, `pos_categories`, `pos_articles`, `fiches_techniques`, `tables_plan`, `commandes`, `commande_lignes` |
| Stocks | `magasins`, `fournisseurs`, `stock_articles`, `stock_niveaux`, `mouvements_stock`, `bons_commande`, `bc_lignes`, `inventaires`, `inventaire_lignes` |
| Étages | `taches_nettoyage`, `mouvements_linge`, `tickets_maintenance`, `maintenance_preventive`, `objets_trouves` |
| Services annexes | `blanchisserie`, `vehicules`, `transports`, `salles`, `reservations_salle` |
| Exploitation | `journees`, `audits_nuit`, `main_courante`, `consignes` |
| Comptabilité | `ecritures`, `periodes_comptables` |

## Relations structurantes

```
entreprises 1─* clients          groupes 1─* reservations          groupes 1─1 folios(COLLECTIF)
groupes 1─* jeux_regles 1─* regles                                 clients 1─* reservations
rooms 1─* reservations           reservations 1─1 folios(INDIVIDUEL) reservations 1─* fiches_police
folios 1─* folio_lignes          folio_lignes *─1 regles (règle appliquée)
folio_lignes 0..1─0..1 folio_lignes (ligne d'origine : les parts d'une consommation scindée)
folios 1─* paiements *─1 sessions_caisse *─1 journees(date)        folios 1─* factures
factures(AV) *─1 factures(FA)    commandes 1─* commande_lignes      pos_articles 1─* fiches_techniques *─1 stock_articles
```

La somme des lignes issues d'une même consommation (`montant_origine`, liées par `ligne_origine_id`) est toujours égale au montant consommé.

## Statuts (énumérations)

| Champ | Valeurs |
| --- | --- |
| `rooms.etat_commercial` | `LIBRE`, `OCCUPEE`, `HORS_SERVICE` (« réservée » est calculé depuis les réservations) |
| `rooms.etat_entretien` | `PROPRE`, `SALE`, `EN_COURS`, `A_CONTROLER` |
| `reservations.statut` | `EN_ATTENTE`, `CONFIRMEE`, `BLOC` (chambre de groupe non nominée ou groupe non confirmé), `CHECKIN`, `CHECKOUT`, `ANNULEE`, `NO_SHOW` |
| `reservations.type_sejour` | `NUITEE`, `DAY_USE` |
| `groupes.statut` | `EN_ATTENTE`, `CONFIRME`, `EN_COURS`, `TERMINE`, `ANNULE` |
| `jeux_regles.statut` | `BROUILLON`, `SOUMIS`, `VALIDE`, `REMPLACE` |
| `regles.mode` | `TOTALE`, `POURCENTAGE`, `PLAFOND_JOUR`, `PLAFOND_SEJOUR`, `PLAFOND_GLOBAL`, `AUCUNE` |
| `regles.beneficiaires` | `TOUS`, `LISTE`, `CHEF` |
| `folios.type` | `INDIVIDUEL`, `COLLECTIF`, `DEBITEUR` (compte entreprise), `PASSANT`, `POS` (folio technique d'un point de vente) |
| `folios.statut` | `OUVERT`, `LITIGE`, `CLOTURE`, `IMPAYE` |
| `folio_lignes.origine` | `RECEPTION`, `AUDIT`, `POS`, `MINIBAR`, `BLANCHISSERIE`, `TRANSPORT`, `TRANSFERT`, `REGULARISATION` |
| `folio_lignes.categorie` | `HEBERGEMENT`, `PETIT_DEJEUNER`, `DEJEUNER`, `DINER`, `BOISSONS`, `BOISSONS_ALCOOL`, `MINIBAR`, `BLANCHISSERIE`, `TRANSPORT`, `SEMINAIRE`, `TELEPHONE`, `AUTRES`, `TAXE_SEJOUR` |
| `paiements.mode` | `ESPECES`, `CARTE`, `MOBILE_MONEY`, `VIREMENT`, `CHEQUE`, `COMPTE_DEBITEUR`, `AVOIR` |
| `paiements.operateur` | `Orange Money`, `MTN MoMo`, `Moov Money`, `Wave` |
| `paiements.statut` | `VALIDE`, `EN_ATTENTE` (Mobile Money non confirmé), `ANNULE` |
| `paiements.caution_statut` | `DETENUE`, `RESTITUEE`, `CONVERTIE` |
| `factures.type` | `FA` (facture), `AV` (avoir) — séries `RA` (reçu d'acompte) et `PRO` (proforma) via `compteurs` |
| `sessions_caisse.statut` | `OUVERTE`, `A_VALIDER`, `CLOTUREE` |
| `commandes.statut` | `OUVERTE`, `PAYEE`, `TRANSFEREE`, `OFFERTE`, `ANNULEE` |
| `tickets_maintenance.statut` | `OUVERT`, `AFFECTE`, `EN_COURS`, `RESOLU`, `VERIFIE` |
| `taches_nettoyage.type / statut` | `DEPART`, `RECOUCHE`, `ARRIVEE` / `A_FAIRE`, `EN_COURS`, `TERMINEE`, `CONTROLEE` |
| `journees.statut` | `OUVERTE`, `CLOTUREE` |

## Numérotation (table `compteurs`)

| Série | Format | Portée |
| --- | --- | --- |
| Facture | `FA-2027-000001` | annuelle |
| Avoir | `AV-2027-000001` | annuelle |
| Reçu d'acompte | `RA-2027-000001` | annuelle |
| Proforma | `PRO-2027-000001` | annuelle |
| Folio | `FO-2027-000001` | annuelle |
| Réservation | `R-2027-00001` | annuelle |
| Groupe | `GR-2027-0001` | annuelle |
| Ticket de caisse | `TREST-2027-000001`, `TBAR-…` | une série par point de vente |
| Commande POS | `CMD-REST-2027-00001` | par point de vente |
| Bon de commande, ticket maintenance, blanchisserie, transport | `BC-`, `MT-`, `BL-`, `TR-` | annuelle |

## DDL de référence

```sql
-- Hotel Manager — schéma SQLite (montants en FCFA entiers)
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS parametres (cle TEXT PRIMARY KEY, valeur TEXT NOT NULL);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY, login TEXT UNIQUE NOT NULL, nom TEXT NOT NULL, role TEXT NOT NULL,
  password_hash TEXT NOT NULL, pin_hash TEXT, actif INTEGER NOT NULL DEFAULT 1,
  echecs INTEGER NOT NULL DEFAULT 0, verrouille INTEGER NOT NULL DEFAULT 0,
  permissions TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS postes (
  id TEXT PRIMARY KEY, nom TEXT NOT NULL, emplacement TEXT, approuve INTEGER NOT NULL DEFAULT 0,
  imprimante_a4 TEXT, imprimante_ticket TEXT, imprimante_cuisine TEXT,
  derniere_connexion TEXT, version_client TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  token TEXT PRIMARY KEY, user_id INTEGER NOT NULL, poste_id TEXT, expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY, ts TEXT NOT NULL DEFAULT (datetime('now','localtime')), user_id INTEGER, user_nom TEXT,
  poste_id TEXT, action TEXT NOT NULL, entite TEXT, entite_id TEXT, details TEXT
);
CREATE TRIGGER IF NOT EXISTS audit_no_update BEFORE UPDATE ON audit_log BEGIN SELECT RAISE(ABORT,'Journal d''audit non modifiable'); END;
CREATE TRIGGER IF NOT EXISTS audit_no_delete BEFORE DELETE ON audit_log BEGIN SELECT RAISE(ABORT,'Journal d''audit non modifiable'); END;

CREATE TABLE IF NOT EXISTS journees (
  id INTEGER PRIMARY KEY, date TEXT UNIQUE NOT NULL, statut TEXT NOT NULL DEFAULT 'OUVERTE',
  ouverte_le TEXT NOT NULL DEFAULT (datetime('now','localtime')), cloturee_le TEXT, cloturee_par INTEGER,
  rapport TEXT
);

CREATE TABLE IF NOT EXISTS room_types (
  id INTEGER PRIMARY KEY, code TEXT UNIQUE NOT NULL, libelle TEXT NOT NULL, prix_base INTEGER NOT NULL,
  prix_dayuse INTEGER NOT NULL DEFAULT 0, capacite INTEGER NOT NULL DEFAULT 2, remise_max INTEGER NOT NULL DEFAULT 20,
  description TEXT, actif INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS saisons (
  id INTEGER PRIMARY KEY, libelle TEXT NOT NULL, date_debut TEXT NOT NULL, date_fin TEXT NOT NULL, majoration_pct INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS rooms (
  id INTEGER PRIMARY KEY, numero TEXT UNIQUE NOT NULL, type_id INTEGER NOT NULL REFERENCES room_types(id),
  etage TEXT, etat_commercial TEXT NOT NULL DEFAULT 'LIBRE', etat_entretien TEXT NOT NULL DEFAULT 'PROPRE',
  caracteristiques TEXT NOT NULL DEFAULT '[]', credits INTEGER NOT NULL DEFAULT 1, hs_retour TEXT, hs_motif TEXT,
  minibar INTEGER NOT NULL DEFAULT 1, actif INTEGER NOT NULL DEFAULT 1, version INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS entreprises (
  id INTEGER PRIMARY KEY, raison_sociale TEXT NOT NULL, compte_contribuable TEXT, adresse TEXT, telephone TEXT, email TEXT,
  contact TEXT, plafond_credit INTEGER NOT NULL DEFAULT 0, remise_pct INTEGER NOT NULL DEFAULT 0,
  facturation_differee INTEGER NOT NULL DEFAULT 0, delai_paiement INTEGER NOT NULL DEFAULT 30, notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY, civilite TEXT, nom TEXT NOT NULL, prenoms TEXT, telephone TEXT, email TEXT,
  date_naissance TEXT, lieu_naissance TEXT, nationalite TEXT, profession TEXT, domicile TEXT,
  piece_type TEXT, piece_numero TEXT, piece_scan TEXT, entreprise_id INTEGER REFERENCES entreprises(id),
  liste_noire INTEGER NOT NULL DEFAULT 0, motif_liste_noire TEXT, vip INTEGER NOT NULL DEFAULT 0, notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS idx_clients_nom ON clients(nom);
CREATE INDEX IF NOT EXISTS idx_clients_tel ON clients(telephone);
CREATE INDEX IF NOT EXISTS idx_clients_piece ON clients(piece_numero);

CREATE TABLE IF NOT EXISTS groupes (
  id INTEGER PRIMARY KEY, code TEXT UNIQUE NOT NULL, nom TEXT NOT NULL, entreprise_id INTEGER REFERENCES entreprises(id),
  chef_client_id INTEGER REFERENCES clients(id), date_arrivee TEXT NOT NULL, date_depart TEXT NOT NULL,
  statut TEXT NOT NULL DEFAULT 'EN_ATTENTE', acompte_requis INTEGER NOT NULL DEFAULT 0, date_limite_bloc TEXT,
  type TEXT, notes TEXT, created_by INTEGER, created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  version INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS groupe_chefs_hist (
  id INTEGER PRIMARY KEY, groupe_id INTEGER NOT NULL, client_id INTEGER, ts TEXT NOT NULL DEFAULT (datetime('now','localtime')), user_id INTEGER, motif TEXT
);

CREATE TABLE IF NOT EXISTS reservations (
  id INTEGER PRIMARY KEY, code TEXT UNIQUE NOT NULL, client_id INTEGER REFERENCES clients(id),
  room_id INTEGER REFERENCES rooms(id), type_id INTEGER REFERENCES room_types(id), groupe_id INTEGER REFERENCES groupes(id),
  entreprise_id INTEGER REFERENCES entreprises(id),
  date_arrivee TEXT NOT NULL, date_depart TEXT NOT NULL, adultes INTEGER NOT NULL DEFAULT 1, enfants INTEGER NOT NULL DEFAULT 0,
  statut TEXT NOT NULL DEFAULT 'CONFIRMEE', type_sejour TEXT NOT NULL DEFAULT 'NUITEE', walkin INTEGER NOT NULL DEFAULT 0,
  prix_nuit INTEGER NOT NULL DEFAULT 0, remise_pct INTEGER NOT NULL DEFAULT 0, remise_validee_par INTEGER,
  petit_dejeuner_inclus INTEGER NOT NULL DEFAULT 0, acompte_requis INTEGER NOT NULL DEFAULT 0, source TEXT, notes TEXT,
  exoneration_taxe INTEGER NOT NULL DEFAULT 0,
  created_by INTEGER, created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  checkin_at TEXT, checkout_at TEXT, annule_motif TEXT, version INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_resa_dates ON reservations(date_arrivee, date_depart);
CREATE INDEX IF NOT EXISTS idx_resa_statut ON reservations(statut);

CREATE TABLE IF NOT EXISTS room_changes (
  id INTEGER PRIMARY KEY, reservation_id INTEGER NOT NULL, ancienne_room INTEGER, nouvelle_room INTEGER,
  ts TEXT NOT NULL DEFAULT (datetime('now','localtime')), motif TEXT, user_id INTEGER, ancien_prix INTEGER, nouveau_prix INTEGER
);

CREATE TABLE IF NOT EXISTS fiches_police (
  id INTEGER PRIMARY KEY, reservation_id INTEGER NOT NULL REFERENCES reservations(id), client_id INTEGER,
  nom TEXT NOT NULL, prenoms TEXT NOT NULL, date_naissance TEXT NOT NULL, lieu_naissance TEXT NOT NULL,
  nationalite TEXT NOT NULL, profession TEXT NOT NULL, domicile TEXT NOT NULL, piece_type TEXT NOT NULL, piece_numero TEXT NOT NULL,
  provenance TEXT NOT NULL, destination TEXT NOT NULL, date_arrivee TEXT NOT NULL, date_depart TEXT NOT NULL,
  derogation TEXT, created_by INTEGER, created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS liste_attente (
  id INTEGER PRIMARY KEY, nom TEXT NOT NULL, telephone TEXT, date_arrivee TEXT, date_depart TEXT, type_id INTEGER,
  nb_chambres INTEGER DEFAULT 1, notes TEXT, statut TEXT NOT NULL DEFAULT 'EN_ATTENTE', created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS jeux_regles (
  id INTEGER PRIMARY KEY, groupe_id INTEGER NOT NULL REFERENCES groupes(id), version INTEGER NOT NULL,
  statut TEXT NOT NULL DEFAULT 'BROUILLON', modele TEXT, empreinte TEXT, hors_politique INTEGER NOT NULL DEFAULT 0,
  accord_directeur_par INTEGER, accord_directeur_le TEXT, valide_le TEXT, mode_signature TEXT, signataire_client_id INTEGER,
  signataire_nom TEXT, agent_id INTEGER, created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')), UNIQUE(groupe_id, version)
);

CREATE TABLE IF NOT EXISTS regles (
  id INTEGER PRIMARY KEY, jeu_id INTEGER NOT NULL REFERENCES jeux_regles(id), code TEXT, categorie TEXT NOT NULL,
  beneficiaires TEXT NOT NULL DEFAULT 'TOUS', beneficiaires_ids TEXT NOT NULL DEFAULT '[]', mode TEXT NOT NULL,
  valeur INTEGER NOT NULL DEFAULT 0, date_debut TEXT, date_fin TEXT, priorite INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS prestations (
  id INTEGER PRIMARY KEY, code TEXT UNIQUE NOT NULL, libelle TEXT NOT NULL, categorie TEXT NOT NULL, service TEXT NOT NULL DEFAULT 'DIVERS',
  prix INTEGER NOT NULL DEFAULT 0, taux_tva INTEGER NOT NULL DEFAULT 18, compte TEXT, cout_fournisseur INTEGER NOT NULL DEFAULT 0,
  sous_traitee INTEGER NOT NULL DEFAULT 0, actif INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS folios (
  id INTEGER PRIMARY KEY, numero TEXT UNIQUE NOT NULL, type TEXT NOT NULL DEFAULT 'INDIVIDUEL',
  reservation_id INTEGER REFERENCES reservations(id), groupe_id INTEGER REFERENCES groupes(id),
  client_id INTEGER REFERENCES clients(id), entreprise_id INTEGER REFERENCES entreprises(id), titulaire TEXT NOT NULL,
  statut TEXT NOT NULL DEFAULT 'OUVERT', plafond_credit INTEGER NOT NULL DEFAULT 0, litige_motif TEXT,
  journee_ouverture TEXT, journee_cloture TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  version INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_folio_resa ON folios(reservation_id);

CREATE TABLE IF NOT EXISTS folio_lignes (
  id INTEGER PRIMARY KEY, folio_id INTEGER NOT NULL REFERENCES folios(id), date_exploitation TEXT NOT NULL,
  prestation_id INTEGER, designation TEXT NOT NULL, categorie TEXT NOT NULL, service TEXT NOT NULL DEFAULT 'DIVERS',
  quantite REAL NOT NULL DEFAULT 1, prix_unitaire INTEGER NOT NULL, montant_ttc INTEGER NOT NULL,
  taux_tva INTEGER NOT NULL DEFAULT 0, montant_ht INTEGER NOT NULL, tva INTEGER NOT NULL DEFAULT 0,
  est_taxe_sejour INTEGER NOT NULL DEFAULT 0, compte TEXT,
  origine TEXT NOT NULL DEFAULT 'RECEPTION', origine_ref TEXT, reservation_id INTEGER,
  montant_origine INTEGER, ligne_origine_id INTEGER, regle_id INTEGER, regle_code TEXT, jeu_version INTEGER, imputation_info TEXT,
  annulee INTEGER NOT NULL DEFAULT 0, motif_annulation TEXT, facture_id INTEGER,
  user_id INTEGER, poste_id TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS idx_lignes_folio ON folio_lignes(folio_id);
CREATE INDEX IF NOT EXISTS idx_lignes_date ON folio_lignes(date_exploitation);
CREATE UNIQUE INDEX IF NOT EXISTS uq_nuitee ON folio_lignes(reservation_id, date_exploitation, origine_ref) WHERE origine='AUDIT' AND annulee=0 AND ligne_origine_id IS NULL;

CREATE TABLE IF NOT EXISTS sessions_caisse (
  id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, poste_id TEXT, point_vente TEXT NOT NULL DEFAULT 'RECEPTION',
  fond_initial INTEGER NOT NULL DEFAULT 0, ouverte_le TEXT NOT NULL DEFAULT (datetime('now','localtime')), cloturee_le TEXT,
  statut TEXT NOT NULL DEFAULT 'OUVERTE', compte TEXT, attendu TEXT, ecart_total INTEGER, justification TEXT,
  validee_par INTEGER, validee_le TEXT, date_exploitation TEXT NOT NULL, versement_montant INTEGER, versement_ref TEXT, versement_dest TEXT
);

CREATE TABLE IF NOT EXISTS mouvements_caisse (
  id INTEGER PRIMARY KEY, session_id INTEGER NOT NULL, type TEXT NOT NULL, mode TEXT NOT NULL DEFAULT 'ESPECES',
  montant INTEGER NOT NULL, motif TEXT, user_id INTEGER, ts TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS paiements (
  id INTEGER PRIMARY KEY, folio_id INTEGER REFERENCES folios(id), commande_id INTEGER, montant INTEGER NOT NULL, mode TEXT NOT NULL,
  operateur TEXT, reference TEXT, payeur TEXT, statut TEXT NOT NULL DEFAULT 'VALIDE', est_caution INTEGER NOT NULL DEFAULT 0,
  caution_statut TEXT, est_acompte INTEGER NOT NULL DEFAULT 0, session_id INTEGER, date_exploitation TEXT NOT NULL,
  user_id INTEGER, poste_id TEXT, motif_annulation TEXT, recu_numero TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS idx_paie_folio ON paiements(folio_id);
CREATE INDEX IF NOT EXISTS idx_paie_session ON paiements(session_id);

CREATE TABLE IF NOT EXISTS compteurs (serie TEXT NOT NULL, annee INTEGER NOT NULL, valeur INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(serie, annee));

CREATE TABLE IF NOT EXISTS factures (
  id INTEGER PRIMARY KEY, numero TEXT UNIQUE NOT NULL, type TEXT NOT NULL, folio_id INTEGER, facture_origine_id INTEGER,
  client_nom TEXT, client_adresse TEXT, client_cc TEXT, date_emission TEXT NOT NULL, date_exploitation TEXT,
  total_ht INTEGER NOT NULL DEFAULT 0, total_tva INTEGER NOT NULL DEFAULT 0, total_taxe_sejour INTEGER NOT NULL DEFAULT 0,
  total_ttc INTEGER NOT NULL DEFAULT 0, total_paye INTEGER NOT NULL DEFAULT 0, net_a_payer INTEGER NOT NULL DEFAULT 0,
  contenu TEXT NOT NULL, empreinte TEXT NOT NULL, motif TEXT, annulee_par_avoir INTEGER, user_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE TRIGGER IF NOT EXISTS facture_no_delete BEFORE DELETE ON factures BEGIN SELECT RAISE(ABORT,'Une facture émise ne peut pas être supprimée'); END;
CREATE TRIGGER IF NOT EXISTS facture_no_update BEFORE UPDATE OF numero, contenu, empreinte, total_ttc ON factures BEGIN SELECT RAISE(ABORT,'Une facture émise ne peut pas être modifiée'); END;

-- Restaurant / bar
CREATE TABLE IF NOT EXISTS points_vente (id INTEGER PRIMARY KEY, code TEXT UNIQUE NOT NULL, libelle TEXT NOT NULL, magasin_id INTEGER, actif INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS pos_categories (id INTEGER PRIMARY KEY, libelle TEXT NOT NULL, couleur TEXT DEFAULT '#2563eb', ordre INTEGER DEFAULT 0, points_vente TEXT NOT NULL DEFAULT '[]');
CREATE TABLE IF NOT EXISTS pos_articles (
  id INTEGER PRIMARY KEY, categorie_id INTEGER REFERENCES pos_categories(id), libelle TEXT NOT NULL, prix INTEGER NOT NULL,
  prix_happy INTEGER, categorie_facturation TEXT NOT NULL DEFAULT 'DEJEUNER', taux_tva INTEGER NOT NULL DEFAULT 18,
  zone_preparation TEXT NOT NULL DEFAULT 'CUISINE', code_barre TEXT, stock_article_id INTEGER, bloquer_stock_negatif INTEGER NOT NULL DEFAULT 0,
  inclus_forfait_pdj INTEGER NOT NULL DEFAULT 0, actif INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS fiches_techniques (id INTEGER PRIMARY KEY, pos_article_id INTEGER NOT NULL, stock_article_id INTEGER NOT NULL, quantite REAL NOT NULL);
CREATE TABLE IF NOT EXISTS tables_plan (id INTEGER PRIMARY KEY, point_vente_id INTEGER NOT NULL, numero TEXT NOT NULL, places INTEGER DEFAULT 4);
CREATE TABLE IF NOT EXISTS commandes (
  id INTEGER PRIMARY KEY, numero TEXT NOT NULL, point_vente_id INTEGER NOT NULL, table_id INTEGER, session_id INTEGER,
  statut TEXT NOT NULL DEFAULT 'OUVERTE', couverts INTEGER DEFAULT 1, remise_pct INTEGER NOT NULL DEFAULT 0, remise_validee_par INTEGER,
  total INTEGER NOT NULL DEFAULT 0, folio_id INTEGER, room_id INTEGER, ticket_numero TEXT, offert_motif TEXT,
  user_id INTEGER, date_exploitation TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')), closed_at TEXT, annule_motif TEXT
);
CREATE TABLE IF NOT EXISTS commande_lignes (
  id INTEGER PRIMARY KEY, commande_id INTEGER NOT NULL, article_id INTEGER, libelle TEXT NOT NULL, quantite REAL NOT NULL DEFAULT 1,
  prix_unitaire INTEGER NOT NULL, commentaire TEXT, envoye INTEGER NOT NULL DEFAULT 0, annulee INTEGER NOT NULL DEFAULT 0,
  motif TEXT, valide_par INTEGER, offert INTEGER NOT NULL DEFAULT 0, inclus_forfait INTEGER NOT NULL DEFAULT 0
);

-- Stocks
CREATE TABLE IF NOT EXISTS magasins (id INTEGER PRIMARY KEY, libelle TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS fournisseurs (id INTEGER PRIMARY KEY, nom TEXT NOT NULL, telephone TEXT, email TEXT, adresse TEXT, compte_contribuable TEXT);
CREATE TABLE IF NOT EXISTS stock_articles (
  id INTEGER PRIMARY KEY, code TEXT UNIQUE, libelle TEXT NOT NULL, categorie TEXT, unite TEXT NOT NULL DEFAULT 'unité',
  unite_achat TEXT, coefficient REAL NOT NULL DEFAULT 1, stock_min REAL NOT NULL DEFAULT 0, cout_moyen REAL NOT NULL DEFAULT 0,
  code_barre TEXT, fournisseur_id INTEGER, peremption TEXT, actif INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS stock_niveaux (magasin_id INTEGER NOT NULL, article_id INTEGER NOT NULL, quantite REAL NOT NULL DEFAULT 0, PRIMARY KEY(magasin_id, article_id));
CREATE TABLE IF NOT EXISTS mouvements_stock (
  id INTEGER PRIMARY KEY, article_id INTEGER NOT NULL, magasin_id INTEGER NOT NULL, type TEXT NOT NULL, quantite REAL NOT NULL,
  cout_unitaire REAL NOT NULL DEFAULT 0, ref TEXT, motif TEXT, user_id INTEGER, date_exploitation TEXT, ts TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE TABLE IF NOT EXISTS bons_commande (
  id INTEGER PRIMARY KEY, numero TEXT UNIQUE NOT NULL, fournisseur_id INTEGER, magasin_id INTEGER, statut TEXT NOT NULL DEFAULT 'BROUILLON',
  date TEXT NOT NULL, notes TEXT, facture_fournisseur TEXT, user_id INTEGER, created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE TABLE IF NOT EXISTS bc_lignes (id INTEGER PRIMARY KEY, bc_id INTEGER NOT NULL, article_id INTEGER NOT NULL, quantite REAL NOT NULL, prix_unitaire REAL NOT NULL DEFAULT 0, quantite_recue REAL NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS inventaires (id INTEGER PRIMARY KEY, magasin_id INTEGER NOT NULL, date TEXT NOT NULL, statut TEXT NOT NULL DEFAULT 'EN_COURS', user_id INTEGER, ecart_valeur INTEGER);
CREATE TABLE IF NOT EXISTS inventaire_lignes (id INTEGER PRIMARY KEY, inventaire_id INTEGER NOT NULL, article_id INTEGER NOT NULL, theorique REAL, compte REAL);

-- Étages
CREATE TABLE IF NOT EXISTS taches_nettoyage (
  id INTEGER PRIMARY KEY, date TEXT NOT NULL, room_id INTEGER NOT NULL, type TEXT NOT NULL, priorite INTEGER DEFAULT 0,
  employe TEXT, credits INTEGER DEFAULT 1, statut TEXT NOT NULL DEFAULT 'A_FAIRE', constat TEXT, UNIQUE(date, room_id)
);
CREATE TABLE IF NOT EXISTS mouvements_linge (id INTEGER PRIMARY KEY, type TEXT NOT NULL, article TEXT NOT NULL, quantite INTEGER NOT NULL, notes TEXT, user_id INTEGER, ts TEXT NOT NULL DEFAULT (datetime('now','localtime')));
CREATE TABLE IF NOT EXISTS tickets_maintenance (
  id INTEGER PRIMARY KEY, numero TEXT NOT NULL, room_id INTEGER, zone TEXT, equipement TEXT, categorie TEXT NOT NULL, priorite TEXT NOT NULL DEFAULT 'NORMALE',
  bloquant INTEGER NOT NULL DEFAULT 0, description TEXT NOT NULL, photo TEXT, statut TEXT NOT NULL DEFAULT 'OUVERT', assigne_a INTEGER,
  date_retour_prevue TEXT, cout_pieces INTEGER NOT NULL DEFAULT 0, resolution TEXT, created_by INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')), affecte_le TEXT, resolu_le TEXT, verifie_le TEXT
);
CREATE TABLE IF NOT EXISTS maintenance_preventive (id INTEGER PRIMARY KEY, libelle TEXT NOT NULL, equipement TEXT, frequence_jours INTEGER NOT NULL DEFAULT 90, prochaine_date TEXT NOT NULL, derniere_date TEXT);
CREATE TABLE IF NOT EXISTS objets_trouves (
  id INTEGER PRIMARY KEY, description TEXT NOT NULL, lieu TEXT, date_trouve TEXT NOT NULL, trouveur TEXT, photo TEXT, stockage TEXT,
  client_presume TEXT, statut TEXT NOT NULL DEFAULT 'EN_STOCK', restitue_a TEXT, restitue_piece TEXT, date_sortie TEXT, user_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

-- Exploitation
CREATE TABLE IF NOT EXISTS main_courante (
  id INTEGER PRIMARY KEY, ts TEXT NOT NULL DEFAULT (datetime('now','localtime')), user_id INTEGER, categorie TEXT NOT NULL,
  texte TEXT NOT NULL, room_id INTEGER, client_nom TEXT, lien_id INTEGER, date_exploitation TEXT
);
CREATE TRIGGER IF NOT EXISTS mc_no_update BEFORE UPDATE ON main_courante BEGIN SELECT RAISE(ABORT,'Entrée de main courante non modifiable'); END;
CREATE TRIGGER IF NOT EXISTS mc_no_delete BEFORE DELETE ON main_courante BEGIN SELECT RAISE(ABORT,'Entrée de main courante non modifiable'); END;
CREATE TABLE IF NOT EXISTS consignes (
  id INTEGER PRIMARY KEY, ts TEXT NOT NULL DEFAULT (datetime('now','localtime')), user_id INTEGER, equipe_cible TEXT NOT NULL,
  texte TEXT NOT NULL, lu_par INTEGER, lu_le TEXT
);
CREATE TABLE IF NOT EXISTS audits_nuit (
  id INTEGER PRIMARY KEY, date TEXT UNIQUE NOT NULL, statut TEXT NOT NULL DEFAULT 'EN_COURS', etape INTEGER NOT NULL DEFAULT 1,
  journal TEXT NOT NULL DEFAULT '[]', user_id INTEGER, debut TEXT NOT NULL DEFAULT (datetime('now','localtime')), fin TEXT
);

-- Services annexes
CREATE TABLE IF NOT EXISTS blanchisserie (
  id INTEGER PRIMARY KEY, numero TEXT NOT NULL, reservation_id INTEGER, room_id INTEGER, client_nom TEXT, pieces TEXT NOT NULL DEFAULT '[]',
  express INTEGER NOT NULL DEFAULT 0, statut TEXT NOT NULL DEFAULT 'COLLECTE', montant INTEGER NOT NULL DEFAULT 0, reclamation TEXT,
  facture INTEGER NOT NULL DEFAULT 0, user_id INTEGER, date_exploitation TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE TABLE IF NOT EXISTS vehicules (id INTEGER PRIMARY KEY, libelle TEXT NOT NULL, immatriculation TEXT, places INTEGER DEFAULT 4, chauffeur TEXT, actif INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS transports (
  id INTEGER PRIMARY KEY, numero TEXT NOT NULL, reservation_id INTEGER, client_nom TEXT, type TEXT NOT NULL DEFAULT 'TRANSFERT',
  date_heure TEXT NOT NULL, duree_h REAL, lieu_prise TEXT, destination TEXT, passagers INTEGER DEFAULT 1, vehicule_id INTEGER, chauffeur TEXT,
  tarif INTEGER NOT NULL DEFAULT 0, statut TEXT NOT NULL DEFAULT 'RESERVE', facture INTEGER NOT NULL DEFAULT 0, notes TEXT, user_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE TABLE IF NOT EXISTS salles (id INTEGER PRIMARY KEY, libelle TEXT NOT NULL, capacite INTEGER, tarif_jour INTEGER NOT NULL DEFAULT 0, tarif_demi INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS reservations_salle (
  id INTEGER PRIMARY KEY, salle_id INTEGER NOT NULL, groupe_id INTEGER, client_nom TEXT, date TEXT NOT NULL, formule TEXT NOT NULL DEFAULT 'JOURNEE',
  participants INTEGER, prestations TEXT, montant INTEGER NOT NULL DEFAULT 0, statut TEXT NOT NULL DEFAULT 'CONFIRMEE', facture INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

-- Comptabilité
CREATE TABLE IF NOT EXISTS ecritures (
  id INTEGER PRIMARY KEY, date TEXT NOT NULL, journal TEXT NOT NULL, compte TEXT NOT NULL, libelle TEXT NOT NULL,
  debit INTEGER NOT NULL DEFAULT 0, credit INTEGER NOT NULL DEFAULT 0, piece TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS idx_ecr_date ON ecritures(date);
CREATE TABLE IF NOT EXISTS periodes_comptables (mois TEXT PRIMARY KEY, statut TEXT NOT NULL DEFAULT 'OUVERTE', cloturee_par INTEGER, cloturee_le TEXT);
CREATE TABLE IF NOT EXISTS file_dgi (id INTEGER PRIMARY KEY, facture_id INTEGER NOT NULL, statut TEXT NOT NULL DEFAULT 'EN_ATTENTE', tentatives INTEGER DEFAULT 0, ts TEXT NOT NULL DEFAULT (datetime('now','localtime')));
```

## Paramètres (table `parametres`, clé → JSON)

| Clé | Contenu (valeurs par défaut) |
| --- | --- |
| `hotel` | nom, raison_sociale, adresse, téléphone, e-mail, compte_contribuable, régime, RCCM, logo (data URL), pied de facture |
| `fiscal` | tva_hebergement 18, tva_restauration 18, tva_services 18, prix_ttc true, taxe_sejour_mode `PAR_PERSONNE_NUIT` \| `POURCENTAGE` \| `FORFAIT_CHAMBRE`, taxe_sejour_montant 500, taxe_sejour_pct 0, taxe_sejour_exo_enfants true, autres_taxes [] |
| `politique` | heure_checkout 12:00, heure_checkin 14:00, heure_depart_tardif_complet 18:00, heure_audit 02:00, plafond_credit 100000, seuil_ecart_caisse 2000, surreservation_pct 0, delai_objets_trouves 90, bloc_liberation_jours 7, verrouillage_minutes 15, penalite_noshow_nuits 1, max_echecs_connexion 5 |
| `comptes` | correspondance SYSCOHADA par catégorie, taxe et mode de paiement (voir `modules/13-comptabilite-rapports.md`) |
| `sauvegarde` | copie_dossier, cle_chiffrement, horaire true, retention 7/4/12 |
| `happy_hour` | actif false, debut 17:00, fin 19:00 |
| `jwt_secret` | généré au premier démarrage |
| `derniere_sauvegarde` | { date, fichier, type, ok, erreur } |
