# Module 04 — Clientèle (clients, entreprises, liste noire, fiche de police)

**Lot** : L1 · **Dépend de** : 02 · **Dossier** : `modules/clientele/`, `web/features/clients`

## Objectif
Une fiche client unique et complète (sans doublon), des entreprises avec leurs conditions, et les obligations de police respectées.

## Exigences
| ID | Exigence |
| --- | --- |
| EF-08 | Détection des doublons à la saisie (même téléphone ou même numéro de pièce) avec proposition d'ouvrir la fiche existante |
| EF-09 | Entreprise : raison sociale, compte contribuable, adresse, contact, plafond de crédit, remise %, facturation différée, délai de paiement ; solde débiteur affiché |
| EF-10 | Liste noire avec motif (réception/direction) ; alerte bloquante à la réservation et au check-in ; poursuite sur validation du directeur (428) |
| EF-11 | Pièce d'identité numérisée (scanner ou webcam via `getUserMedia`) jointe à la fiche ; visible réception/direction uniquement |
| EF-78 | Champs complets de la fiche de police sur la fiche client : nom, prénoms, date et lieu de naissance, nationalité, profession, domicile, type et numéro de pièce |
| EF-80/81 | Registre des voyageurs (période) imprimable et exportable PDF/Excel ; consultation tracée |
| ENF-13 | Loi 2013-450 : accès restreint, durée de conservation paramétrable, export et anonymisation sur demande (hors données de facturation légales) |
| — | Import Excel des clients et entreprises (modèle fourni) |
| — | Historique des séjours sur la fiche client ; indicateur VIP |

## Entités
`clients`, `entreprises`, `fiches_police` (créées au check-in, module 05).

## Écrans
- **Clients** : recherche instantanée (nom, téléphone, pièce, e-mail), badge liste noire (rôles autorisés), badge VIP ; fiche en onglets Identité · Pièce · Séjours · Notes.
- **Entreprises** : liste avec solde débiteur, fiche, lien vers le compte débiteur et la balance âgée.
- **Registre de police** : filtre de dates, tableau, Imprimer / Exporter.

## Critères d'acceptation
- [ ] Saisie d'un téléphone déjà connu → avertissement « Client existant : KOUASSI Jean-Marc » avec bouton « Utiliser cette fiche ».
- [ ] Un magasinier ne voit jamais le motif de liste noire ni la pièce numérisée (vérifier la réponse API, pas seulement l'écran).
- [ ] Réservation pour un client en liste noire → 428 → validation directeur → réservation créée, trace d'audit.
- [ ] Registre du jour exporté en Excel avec une ligne par occupant.
