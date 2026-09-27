# Module 07 — Facturation (folios, imputation, paiements, cautions, factures)

**Lot** : L1 (cœur) · **Dépend de** : 02, 04 · **Dossier** : `modules/facturation/` (`imputation.ts`, `folios.ts`, `paiements.ts`, `factures.ts`)

## Objectif
Le folio est le compte courant du séjour ; la facture en est la photographie légale, générée automatiquement et intangible. C'est le point de convergence de tous les services.

## Exigences
| ID | Exigence |
| --- | --- |
| F-01 | Folios typés `INDIVIDUEL`, `COLLECTIF`, `DEBITEUR`, `PASSANT`, `POS` ; numéro `FO-AAAA-nnnnnn` ; plafond de crédit (défaut `politique.plafond_credit`) |
| F-02 | Cycle `OUVERT ↔ LITIGE`, `OUVERT → CLOTURE | IMPAYE`, `IMPAYE → CLOTURE` après règlement ; litige = paiements acceptés, facture bloquée |
| F-03 | `imputer()` unique pour toute charge sur un séjour (`BUSINESS_RULES.md` §4) ; `posterLigne()` pour les folios hors séjour |
| F-04 | Ajout de prestation depuis le catalogue ou libre (désignation, catégorie, quantité, PU) |
| F-05 | Annulation de ligne : motif + validation, seulement si non facturée et de la journée en cours ; sinon régularisation (EF-69) |
| EF-23/24/106 | Transfert de lignes entre folios (ex. hébergement vers le folio de l'entreprise) → factures séparées |
| EF-94 | Réimputation vers/depuis le collectif : validation obligatoire |
| EF-27/107 | Modes : espèces, carte (référence obligatoire), Mobile Money (opérateur + référence obligatoires ; option « à confirmer » → `EN_ATTENTE`), virement, chèque, compte débiteur, avoir |
| EF-108 | Paiement fractionné multi-modes et multi-payeurs (`payeur`) |
| EF-109 | Acompte (`est_acompte`, reçu `RA-…`) imputé au folio dès la réservation |
| EF-110 | Caution séparée du solde et du CA ; restitution ou conversion en paiement, tracées |
| EF-111 | Remboursement de trop-perçu (paiement négatif, même mode si possible), validation |
| EF-112 | Tout paiement lié à utilisateur, poste, session de caisse (obligatoire sauf compte débiteur/avoir), date d'exploitation |
| EF-25/RG-13 | Numérotation FA/AV sans trou, en transaction |
| EF-102 à 105 | Génération automatique (au check-out, à la clôture du collectif, manuelle pour passant/débiteur) : lignes non facturées regroupées par famille, HT/TVA/taxe/TTC, paiements, net à payer ; contenu JSON figé + empreinte + archive ; file DGI |
| EF-26/71 | Facture PDF A4 avec mentions obligatoires ; impression ou PDF |
| RG-12 | Avoir total (motif, validation) → folio rouvert → correction → nouvelle facture |
| EF-28 | Comptes débiteurs : report du solde au check-out, relevé, encaissements ultérieurs, balance âgée |
| — | Proforma (série PRO, sans valeur légale) pour groupes et entreprises |
| — | Chèque/virement rejeté : annulation du paiement → folio `IMPAYE` |

## Écrans
Folios (recherche, filtres type/statut, solde) · Fiche folio (voir `UI_UX.md` §6) · Dialogue d'encaissement (`PaymentForm`) · Transfert de lignes (sélection + folio cible + motif) · Factures (liste filtrable, visualisation avec badge « Intégrité vérifiée » si l'empreinte correspond, Imprimer, PDF, Émettre un avoir) · Relevé de folio imprimable.

## Critères d'acceptation
- [ ] 20 appels simultanés de génération de facture → numéros consécutifs sans trou ni doublon.
- [ ] Toute tentative SQL de `UPDATE factures SET total_ttc=…` ou `DELETE` échoue (trigger).
- [ ] Avoir sur FA-000003 → AV-000001 à montants négatifs, FA marquée annulée, folio rouvert, nouvelle facture FA-000004 possible.
- [ ] Mobile Money sans référence → 400 ; « à confirmer » → non compté dans le solde jusqu'à confirmation.
- [ ] Caution 20 000 et solde 15 000 : la conversion transforme toute la caution (20 000) en paiement → trop-perçu 5 000 → remboursement validé → solde 0.
- [ ] Ligne d'hier annulée → 422 « journée clôturée : régularisation ».
- [ ] Check-out avec règlement « compte entreprise » → folio individuel soldé par `COMPTE_DEBITEUR`, ligne « Report folio FO-… » sur le folio DEBITEUR de l'entreprise, alerte si plafond dépassé.
- [ ] Facture d'un folio avec taxe de séjour : taxe hors HT, TVA 0, ligne distincte.

## Cas limites
Folio sans ligne à facturer (membre dont tout est au collectif) → pas de facture, clôture directe · paiement sur folio clôturé → refus · plusieurs cautions sur un folio.
