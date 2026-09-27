# Module 01 — Sécurité (utilisateurs, rôles, postes, audit)

**Lot** : L0 · **Dépend de** : — · **Dossier** : `apps/server/src/core/{auth,postes,permissions,audit}.ts`, `modules/securite/`

## Objectif
Seuls des utilisateurs authentifiés, sur des postes approuvés, accèdent aux fonctions permises par leur rôle ; toute action sensible est tracée de façon non modifiable.

## Exigences
| ID | Exigence |
| --- | --- |
| EF-01 | Enregistrement du poste au premier appel (`X-Poste-Id`, `X-Poste-Nom`) ; poste non approuvé → 403 `POSTE_NON_APPROUVE` ; le premier poste est approuvé automatiquement |
| EF-02 | JWT 8 h + refresh 7 j renouvelé en silence ; verrouillage d'écran après `politique.verrouillage_minutes` (15) d'inactivité |
| EF-03 | Connexion rapide par PIN 4–6 chiffres (caisses, postes partagés) ; « Changer d'utilisateur » sans fermer l'application |
| EF-04 | Compte verrouillé après `politique.max_echecs_connexion` (5) échecs ; déverrouillage par l'ADMIN |
| EF-S1/S2 | Validation par un responsable (login + PIN) sans changer d'utilisateur, tracée (voir `PERMISSIONS.md` §4) |
| ENF-11 | Mots de passe (≥ 6 caractères, complexité paramétrable) et PIN hachés bcrypt |
| ENF-12 | `audit_log` non modifiable (triggers `BEFORE UPDATE/DELETE → RAISE(ABORT)`), consultable ADMIN/DIRECTEUR |
| — | Droits fins par utilisateur (surcharge de la matrice) éditables dans l'interface |

## Entités
`users`, `postes`, `refresh_tokens`, `audit_log`, `parametres(jwt_secret)`.

## Écrans
- **Connexion** : identifiant + mot de passe, onglet « Code PIN » (pavé numérique tactile), message clair si poste non approuvé (avec nom du poste).
- **Verrouillage** : overlay plein écran, nom de l'utilisateur, champ mot de passe/PIN, lien « Changer d'utilisateur ».
- **Administration › Utilisateurs** : tableau (nom, identifiant, rôle, actif, verrouillé, PIN défini), formulaire création/édition, onglet « Droits fins » (grille module × niveau pré-remplie avec le défaut du rôle, écarts surlignés), bouton « Déverrouiller ».
- **Administration › Postes** : liste (nom, emplacement, approuvé, connecté maintenant, dernière connexion, version), approuver/révoquer, imprimantes.
- **Administration › Journal d'audit** : filtres date, utilisateur, action, texte ; export Excel.

## Critères d'acceptation
- [ ] Étant donné un nouveau poste, quand il appelle `/auth/login`, alors il reçoit 403 `POSTE_NON_APPROUVE` et apparaît dans la liste des postes ; après approbation, la connexion réussit.
- [ ] 5 mots de passe faux → compte verrouillé, même le bon mot de passe est refusé ; l'ADMIN déverrouille → connexion possible ; chaque échec est tracé.
- [ ] Jeton expiré → le client obtient un nouveau jeton via `/auth/refresh` sans que l'utilisateur ne voie rien.
- [ ] Un caissier POS appelle `GET /compta/ecritures` → 403.
- [ ] Un réceptionniste avec surcharge `compta: 'L'` peut lire les écritures.
- [ ] `UPDATE audit_log …` en SQL direct échoue.
- [ ] 15 min sans activité → écran verrouillé ; PIN correct → reprise à l'endroit exact.

## Cas limites
Deux postes avec le même nom (autorisé, distingués par UUID) · suppression d'un poste connecté (ses requêtes suivantes → 403) · ADMIN qui tente de se désactiver → 422.
