# Glossaire

| Terme | Définition | Dans le code |
| --- | --- | --- |
| ADR | Prix moyen par nuit vendue (Average Daily Rate) = CA hébergement / nuitées vendues | `rapports.adr` |
| Allotement / bloc | Chambres réservées pour un groupe jusqu'à une date limite | `reservations.statut = 'BLOC'` |
| Audit de nuit | Clôture guidée de la journée : no-shows, nuitées, contrôles, sauvegarde, changement de date | `modules/exploitation/audit-nuit` |
| Avoir | Facture négative annulant une facture émise | `factures.type = 'AV'` |
| Caution | Somme bloquée à l'arrivée, hors chiffre d'affaires, restituée ou convertie au départ | `paiements.est_caution` |
| Chef de groupe | Client interlocuteur du groupe, signataire des règles de répartition | `groupes.chef_client_id` |
| Compte collectif / folio maître | Folio du groupe recevant les charges prises en charge par l'organisateur | `folios.type = 'COLLECTIF'` |
| Compte débiteur | Folio d'une entreprise en facturation différée | `folios.type = 'DEBITEUR'` |
| Date d'exploitation | Journée comptable de l'hôtel ; change à la clôture de l'audit de nuit, pas à minuit | `dateExploitation()` |
| Day-use | Location d'une chambre en journée, sans nuitée | `type_sejour = 'DAY_USE'` |
| Fiche de police | Déclaration d'identité du voyageur exigée par les autorités | `fiches_police` |
| Fiche technique | Recette d'un plat ou d'une boisson déduite du stock à chaque vente | `fiches_techniques` |
| Folio | Compte courant d'un séjour (prestations et paiements) | `folios`, `folio_lignes` |
| Imputation | Affectation d'une charge au bon folio selon les règles du groupe | `imputer()` |
| Main courante | Registre chronologique non modifiable des événements et consignes | `main_courante` |
| No-show | Client attendu qui ne s'est pas présenté | `statut = 'NO_SHOW'` |
| Nuitée | Une nuit facturée pour une chambre | ligne `origine='AUDIT'`, `origine_ref='NUITEE'` |
| POS | Caisse enregistreuse d'un point de vente | `modules/restaurant` |
| Recouche | Nettoyage quotidien d'une chambre occupée | `taches_nettoyage.type = 'RECOUCHE'` |
| RevPAR | Revenu hébergement par chambre disponible = CA hébergement / chambres disponibles | `rapports.revpar` |
| Rooming list | Liste nominative des membres d'un groupe et de leurs chambres | import Excel |
| Session de caisse | Période de responsabilité d'un agent sur une caisse, du fond initial au comptage | `sessions_caisse` |
| SYSCOHADA | Système comptable de l'espace OHADA | `parametres.comptes` |
| Taux d'occupation | Chambres occupées / chambres disponibles | — |
| Ticket Z | Récapitulatif de clôture d'une session de caisse | `/pos/ticket-z/:id` |
| Walk-in | Client arrivant sans réservation | `reservations.walkin = 1` |
