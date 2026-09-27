# API REST — conventions et catalogue

Base : `http://<serveur>:4580/api`. JSON UTF-8. Toutes les routes (sauf `health`, `setup`, `auth/login`, `auth/refresh`) exigent `Authorization: Bearer <jwt>` **et** `X-Poste-Id` d'un poste approuvé.

## 1. Conventions

- Noms de ressources en français, pluriel, kebab-case : `/reservations/:id/changer-chambre`.
- Actions métier = `POST /ressource/:id/<verbe>` (`/checkin`, `/checkout`, `/annuler`, `/valider`).
- Entrées validées par Zod (`packages/shared/schemas`). Champ inconnu ignoré, champ requis manquant → 400.
- Écritures sensibles acceptent `validation: { login, secret }` (voir `PERMISSIONS.md` §4).
- Modification avec verrouillage optimiste : le client envoie `version` ; conflit → 409.
- Listes : filtres en query string (`?statut=CHECKIN&q=kouassi&du=2027-01-01&au=2027-01-31`), limite 500 lignes.
- Montants entiers FCFA ; dates `YYYY-MM-DD` ; horodatages `YYYY-MM-DD HH:MM:SS` (heure serveur).

## 2. Erreurs normalisées

```json
{ "code": "REGLE_METIER", "message": "La chambre 204 n'est pas prête (sale) : contrôle de la gouvernante requis", "details": {} }
```

| HTTP | code | Usage |
| --- | --- | --- |
| 400 | `VALIDATION` | Donnée invalide ou manquante |
| 401 | `AUTH` | Jeton absent/expiré, identifiants faux, compte verrouillé |
| 403 | `DROIT_INSUFFISANT` | Permission manquante |
| 403 | `POSTE_INCONNU` / `POSTE_NON_APPROUVE` | Poste non identifié / en attente d'approbation |
| 404 | `INTROUVABLE` | Ressource inconnue |
| 409 | `CONFLIT` | Verrouillage optimiste, doublon |
| 409 | `DEJA_INSTALLE` | `/setup` appelé alors que des utilisateurs existent |
| 422 | `REGLE_METIER` | Règle de gestion violée (message lisible, cite la règle) |
| 428 | `VALIDATION_RESPONSABLE` | Action nécessitant la validation d'un responsable |
| 500 | `ERREUR_INTERNE` | Message générique ; détail uniquement dans `serveur.log` |

## 3. Catalogue

Légende permission : `module:niveau`.

### Système et sécurité
| Méthode | Route | Perm. | Rôle |
| --- | --- | --- | --- |
| GET | `/health` | — | `{ ok, version, nom, heure, installe }` |
| POST | `/setup` | — (seulement si aucun utilisateur) | Assistant : hôtel, fiscal, admin, `demo` |
| POST | `/auth/login` | — | `{ login, password }` ou `{ login, pin }` → `{ token, refresh, user{perms}, poste }` |
| POST | `/auth/refresh` · `/auth/logout` · `/auth/verify` · `/auth/password` · GET `/auth/me` | — / auth | Jetons, déverrouillage d'écran, changement de mot de passe |
| GET/POST/PUT | `/admin/users[/:id]` | admin:E | Comptes, rôle, PIN, droits fins, déverrouillage |
| GET/PUT/DELETE | `/admin/postes[/:id]` | admin:E | Approbation, imprimantes, état connecté |
| GET/PUT | `/poste`, `/poste/imprimantes` | auth | Configuration du poste courant |
| GET/PUT | `/admin/parametres[/:cle]` | admin:E | `hotel`, `fiscal`, `politique`, `comptes`, `sauvegarde`, `happy_hour` |
| GET | `/admin/roles` | auth | Rôles, modules, matrice par défaut |
| GET | `/admin/audit` | admin:L | Journal d'audit filtrable |
| GET/POST | `/admin/sauvegardes`, `/:fichier`, `/:fichier/restaurer` | admin:E | Liste, sauvegarde manuelle, téléchargement, restauration planifiée |
| GET | `/admin/diagnostic`, `/admin/logs` | admin:L | État serveur, disque, postes, intégrité ; journal technique |

### Hébergement, clientèle, réservations
| Méthode | Route | Perm. |
| --- | --- | --- |
| CRUD | `/room-types`, `/saisons` | tarifs:E |
| GET/POST/PUT | `/rooms`, `/rooms/import` | chambres:L / admin:E |
| GET | `/tarif?type_id&arrivee&type_sejour` | reservations:L |
| GET | `/disponibilites?arrivee&depart&type_id&type_sejour&caracteristiques` | reservations:L |
| GET | `/planning?debut&jours` | chambres:L |
| CRUD | `/clients`, `/clients/doublons`, `/clients/:id/liste-noire`, `/clients/import` | clients:E |
| CRUD | `/entreprises` (avec `solde_debiteur`) | clients:E |
| CRUD | `/liste-attente` | reservations:E |
| GET/POST/PUT | `/reservations[/:id]` | reservations:E |
| POST | `/reservations/:id/{checkin, checkout, annuler, changer-chambre, prolonger, confirmer, deplacer}` | reservations:E |
| GET | `/reservations/:id/pre-checkout` | reservations:E |
| POST | `/walkin` | reservations:E |
| GET | `/presents` | auth (mode dégradé, évacuation) |

### Groupes
| Méthode | Route | Perm. |
| --- | --- | --- |
| GET/POST/PUT | `/groupes[/:id]`, GET `/groupes/modeles` | groupes:E |
| POST | `/groupes/:id/{chambres, membres, rooming, chef, confirmer(V), annuler(V), liberer, cloturer}` | groupes:E/V |
| POST | `/groupes/:id/membres/:rid/detacher` | groupes:E |
| POST/PUT | `/groupes/:id/jeux`, `/jeux/:id`, `/jeux/:id/{modele, soumettre, rejeter, accord-directeur(V), valider}` | groupes:E/V |
| GET | `/jeux/:id/simulation`, `/groupes/:id/releve?date` | groupes:L |

### Facturation et caisse
| Méthode | Route | Perm. |
| --- | --- | --- |
| GET | `/ref/facturation` (catégories, modes, opérateurs) | auth |
| GET/POST | `/folios[/:id]` | folios:E |
| POST | `/folios/:id/{lignes, regularisation, litige, paiements, rembourser, caution, facturer, cloturer}` | folios:E |
| PUT | `/folios/:id/plafond` | folios:V |
| POST | `/folios/lignes/:id/annuler`, `/folios/lignes/transferer` | folios:E (+validation) |
| POST | `/paiements/:id/{confirmer, annuler}` | folios:E |
| GET | `/factures[/:id]` (avec contrôle d'intégrité) ; POST `/factures/:id/avoir` ; POST `/proforma` | folios:L/E |
| GET/POST | `/caisse/session`, `/caisse/ouvrir`, `/caisse/sessions[/:id]`, `/caisse/mouvements` | caisse:E |
| POST | `/caisse/sessions/:id/{cloturer, valider(V), versement}` | caisse:E/V |

### Restaurant, stocks
| Méthode | Route | Perm. |
| --- | --- | --- |
| CRUD | `/pos/{points-vente, categories, articles, tables}` ; GET/PUT `/pos/fiches/:articleId` | pos:V / stocks:E |
| GET | `/pos/config` (points de vente, catégories, articles avec prix courant, tables, chambres occupées) | pos:L |
| GET/POST | `/pos/commandes[/:id]`, `/pos/commandes/:id/lignes[/:lid]` | pos:E |
| POST | `/pos/commandes/:id/{envoyer, remise, offrir, diviser, payer, transfert, annuler}` ; `/lignes/:lid/annuler` | pos:E (+validation) |
| GET | `/pos/ticket-z/:sessionId` | pos:L |
| CRUD | `/stocks/{magasins, fournisseurs, articles}` | stocks:E |
| GET | `/stocks/{niveaux, alertes, mouvements}` ; POST `/stocks/mouvements` | stocks:L/E |
| GET/POST | `/stocks/bons[/:id]`, `/stocks/bons/:id/reception` | stocks:E |
| GET/POST/PUT | `/stocks/inventaires[/:id]`, `/stocks/inventaires/:id/valider` | stocks:E |

### Étages, services annexes
| Méthode | Route | Perm. |
| --- | --- | --- |
| GET | `/etages/chambres`, `/etages/divergences`, `/etages/linge` | housekeeping:L |
| POST | `/etages/chambres/:id/etat`, `/etages/plan/{generer, affecter}`, `/etages/minibar`, `/etages/linge` ; PUT `/etages/taches/:id` | housekeeping |
| GET/POST/PUT | `/maintenance/tickets[/:id]`, `/maintenance/preventive[/:id/fait]`, `/maintenance/historique` | maintenance:E |
| GET/POST/PUT | `/objets[/:id]` | objets:E |
| CRUD | `/prestations` | tarifs:E |
| GET/POST/PUT | `/services/{blanchisserie, transports, vehicules, salles, reservations-salle}` ; POST `/services/reservations-salle/:id/facturer` | folios:E / groupes:E |
| POST | `/services/poster` (prestation sur chambre ou vente directe) ; GET `/services/production` | folios:E |

### Exploitation, comptabilité, rapports
| Méthode | Route | Perm. |
| --- | --- | --- |
| GET/POST | `/main-courante`, `/consignes`, `/consignes/:id/lu` | main_courante:E |
| GET | `/journee`, `/journees`, `/journees/:date/rapport` ; POST `/journees/:date/rouvrir` (ADMIN) | auth / audit:L |
| GET | `/audit-nuit` (état + données de chaque étape) ; POST `/audit-nuit/demarrer`, `/audit-nuit/etape/1..8` | audit:E |
| GET | `/compta/{ecritures, tva?mois, taxe-sejour?mois, balance-agee, journaux, periodes, file-dgi}` | compta:L |
| POST | `/compta/ecritures/regenerer`, `/compta/periodes/:mois/cloturer` | compta:E |
| GET | `/police/registre?du&au` | clients:L (réception/direction) |
| GET | `/rapports/{dashboard, occupation, ca, prevision, nationalites, ecarts-caisse, ventes-pos, impayes, journalier}` | rapports:L |

## 4. Temps réel (Socket.IO)

- Connexion : `io(url, { auth: { token } })`.
- Événements serveur → client : `change { topics[] }`, `notification { role, message, niveau }`, `bon_preparation { commande, table, bons{CUISINE[], BAR[]} }`.
