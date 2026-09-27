# PRD — Hotel Manager, logiciel prêt à l'emploi multi-postes Windows

## Sources

- Cahier des charges « Hotel Manager, logiciel prêt à l'emploi multi-postes Windows » (TIAF, 26/09/2026).
- Dossier d'analyse logique v2.1 (TIAF, 26/09/2026) : cas d'utilisation, diagrammes, modèle de classes.
- Maître d'ouvrage : Technologie & Innovation Afrique (TIAF), Abidjan.

## 1. Vision

Un hôtel de 30 à 100 chambres installe Hotel Manager en une journée, le paramètre lui-même et exploite toute son activité (réception, groupes, restaurant, bar, étages, caisse, comptabilité) sur 5 à 10 postes Windows reliés en réseau local, **sans Internet et sans développement spécifique**.

## 2. Problèmes résolus

| Problème | Réponse du produit |
| --- | --- |
| Coupures Internet fréquentes | Fonctionnement 100 % local ; Internet seulement pour les options |
| Données confiées à un hébergeur externe | Base sur un poste serveur de l'hôtel |
| Registres papier, cahiers, tableurs éclatés | Une base unique partagée par tous les postes en temps réel |
| Écarts de caisse inexpliqués | Sessions de caisse par agent, comptage à l'aveugle, journal d'audit |
| Obligations légales manuelles | Fiche de police, taxe de séjour, TVA, écritures SYSCOHADA automatiques |

## 3. Objectifs mesurables

1. Installation complète (serveur + 3 postes + paramétrage de base) en **moins d'une journée**.
2. **10 postes** simultanés, écrans courants en **moins de 1 s**, vente POS en **moins de 2 s**.
3. Propagation d'un changement d'état de chambre à tous les postes en **moins de 2 s**.
4. **Zéro trou** dans la numérotation des factures, zéro facture modifiable après émission.
5. Restauration complète d'une sauvegarde en **moins d'une heure**.
6. Recette : un hôtel pilote exploite la version complète **15 jours** sans anomalie bloquante ni recours au papier.

## 4. Utilisateurs

11 rôles (détail et matrice : `PERMISSIONS.md`) :

| Rôle | Mission | Poste |
| --- | --- | --- |
| ADMIN | Paramétrage, comptes, postes, sauvegardes, licence | Serveur / direction |
| DIRECTEUR | Rapports, validations (remises, annulations, écarts) | Direction |
| RECEPTIONNISTE | Réservations, check-in/out, fiche de police, folios, encaissements | Réception |
| AUDITEUR_NUIT | Main courante de nuit, audit de nuit, clôture de la journée | Réception |
| GOUVERNANTE | Plan de nettoyage, contrôle des chambres, objets trouvés | Office / tablette |
| TECHNICIEN | Tickets de maintenance, chambres hors service | Office technique |
| RESPONSABLE_SERVICE | Supervision restaurant/bar, ventes, inventaires | Restaurant / bar |
| CAISSIER_POS | Commandes et encaissements au restaurant ou au bar | Caisse POS |
| MAGASINIER | Réceptions, sorties, inventaires | Économat |
| COMPTABLE | Journaux, TVA, taxe de séjour, exports | Comptabilité |
| RESPONSABLE_GROUPE | Groupes, séminaires, événements | Commercial |

Acteurs externes sans compte : client, chef de groupe (signe les règles de répartition), fournisseurs, DGI, police.

## 5. Périmètre fonctionnel (13 modules)

| # | Module | Spec |
| --- | --- | --- |
| 01 | Sécurité (utilisateurs, rôles, postes, audit) | `modules/01-securite.md` |
| 02 | Référentiel et paramètres | `modules/02-referentiel.md` |
| 03 | Hébergement (chambres, tarifs, planning) | `modules/03-hebergement.md` |
| 04 | Clientèle (clients, entreprises, fiche de police) | `modules/04-clientele.md` |
| 05 | Réservations et séjour | `modules/05-reservations.md` |
| 06 | Groupes et répartition des charges | `modules/06-groupes.md` |
| 07 | Facturation (folios, imputation, paiements, factures) | `modules/07-facturation.md` |
| 08 | Restaurant / bar (POS) | `modules/08-restaurant-pos.md` |
| 09 | Stocks et achats | `modules/09-stocks.md` |
| 10 | Étages (housekeeping, maintenance, objets trouvés) | `modules/10-etages.md` |
| 11 | Services annexes (blanchisserie, transport, salles) | `modules/11-services-annexes.md` |
| 12 | Exploitation (caisse, main courante, audit de nuit) | `modules/12-exploitation.md` |
| 13 | Comptabilité, fiscalité, rapports | `modules/13-comptabilite-rapports.md` |

## 6. Hors périmètre v2.0

Réservation en ligne et channel manager (Booking, Expedia) · serrures électroniques · terminaux de paiement intégrés · multi-établissements et multi-devises · paie/RH · IA. L'architecture doit permettre de les ajouter plus tard sans reprise des données.

## 7. Contraintes

- Windows 10/11 64 bits (serveur : Windows 10/11 Pro ou Server 2019/2022).
- Réseau local du personnel séparé du Wi-Fi clients.
- Interface en français, montants en FCFA entiers.
- Conformité : loi ivoirienne n° 2013-450 (données personnelles), mentions obligatoires des factures, SYSCOHADA.

## 8. Points ouverts (à trancher, voir aussi `DECISIONS.md`)

- [ ] Produit multi-hôtels commercialisé par TIAF ou premier hôtel pilote à nommer.
- [ ] Taux de TVA par famille, facture normalisée électronique DGI obligatoire ou non.
- [ ] Taxe de séjour de la commune (mode, montant, exonérations).
- [ ] Contenu et transmission de la fiche de police.
- [ ] Logiciel comptable cible et format d'import.
- [ ] Politiques commerciales (heures, départ tardif, plafond de crédit, no-show).
- [ ] Copie cloud des sauvegardes acceptée ou non.
- [ ] Modèle de licence et tarif.

Tant qu'un point est ouvert, **implémenter la valeur par défaut paramétrable** indiquée dans `BUSINESS_RULES.md`.
