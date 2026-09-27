# Module 13 — Comptabilité, fiscalité et rapports

**Lot** : L6 (rapports de base dès L2) · **Dépend de** : 07, 12 · **Dossier** : `modules/comptabilite/`, `modules/rapports/`, `web/features/{compta,rapports,dashboard}`

## Objectif
Produire des écritures SYSCOHADA prêtes à importer, les états fiscaux (TVA, taxe de séjour) et des indicateurs de pilotage fiables. Hotel Manager ne remplace pas le logiciel comptable.

## Exigences — Comptabilité et fiscalité
| ID | Exigence |
| --- | --- |
| EF-73 | Plan de correspondance paramétrable (`parametres.comptes`) : catégorie → compte de produit, taxe → compte, mode de paiement → compte de trésorerie |
| EF-74 | Écritures générées à la clôture de chaque journée (`BUSINESS_RULES.md` §13) ; régénération possible tant que la période n'est pas clôturée ; contrôle d'équilibre |
| EF-75 | Journaux de ventes, caisse, banque, achats ; balance âgée des débiteurs (0–30, 31–60, 61–90, > 90 jours) |
| EF-76 | Export CSV (séparateur `;`, UTF-8 avec BOM, dates JJ/MM/AAAA) et Excel ; colonnes : date, journal, compte, libellé, débit, crédit, pièce ; format Sage paramétrable |
| EF-77 | Clôture mensuelle : toutes les journées clôturées, verrouillage de la période |
| EF-T1 | État mensuel de TVA collectée par catégorie et taux ; état de reversement de la taxe de séjour par jour |
| EF-71 | Mentions obligatoires des factures (module 07) |
| EF-72 | File d'attente DGI (`file_dgi`) : factures en attente de transmission ; transmission réelle à implémenter quand les spécifications DGI seront connues (interface `DgiTransmitter` avec implémentation « aucune » par défaut) |

Correspondance par défaut :

| Élément | Compte |
| --- | --- |
| Hébergement | 706100 |
| Restauration (petit-déjeuner, déjeuner, dîner) | 706200 |
| Boissons, minibar | 706300 |
| Blanchisserie · Transport · Séminaire · Téléphone · Autres | 706400 · 706500 · 706600 · 706700 · 706800 |
| TVA collectée · Taxe de séjour | 443100 · 447100 |
| Clients · Clients débiteurs · Acomptes et cautions | 411100 · 411200 · 419100 |
| Espèces · Carte et virement · Chèques · Mobile Money | 571100 · 521100 · 513000 · 585000 |

## Exigences — Rapports (EF-29, EF-30)
| Rapport | Contenu |
| --- | --- |
| Tableau de bord | Occupation du jour, chambres libres/occupées/hors service/sales, arrivées et départs (prévus/faits), présents, CA et encaissements du jour, 7 derniers jours, alertes (sauvegarde, validations, stock, impayés, tickets) |
| Occupation | Par jour sur une période : nuitées, taux, ADR, RevPAR + synthèse |
| Chiffre d'affaires | Par service, par catégorie (HT, TVA, TTC), encaissements par mode et opérateur |
| Rapport journalier de direction | Figé à l'audit de nuit (module 12) |
| Prévision à 30 jours | Chambres réservées et taux par jour, arrivées |
| Nationalités et provenances | Depuis les fiches de police |
| Marges restauration | Par article : quantité, CA, coût matière (fiches techniques × CMP), marge et taux |
| Écarts de caisse par agent | Sessions, sessions avec écart, écart cumulé, pire manque |
| Impayés et débiteurs | Folios IMPAYE et comptes débiteurs avec solde |

Tous exportables en PDF (impression A4) et Excel (EF-30).

## Critères d'acceptation
- [ ] Journée avec 3 nuitées (45 000 TTC chacune, TVA 18 %) et taxe 1 500 : crédit 706100 = 3 × 38 136, crédit 443100 = 3 × 6 864, crédit 447100 = 1 500, débit 411100 = 136 500 ; Σ débits = Σ crédits.
- [ ] Ligne transférée d'un folio à un autre le même jour : comptée une seule fois dans les ventes.
- [ ] Clôture de mars alors qu'une journée de mars est ouverte → refus.
- [ ] Export CSV ouvert dans Excel français sans problème d'accents ni de colonnes.
- [ ] Balance âgée : facture débitrice de 45 jours partiellement payée → reste dans la tranche 31–60.
- [ ] ADR = CA nuitées / nuitées vendues ; RevPAR = CA nuitées / (chambres × jours) — vérifiés sur un jeu de données connu.
- [ ] Rapport d'occupation sur 1 an généré en < 10 s.
