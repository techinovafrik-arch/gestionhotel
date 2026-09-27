# Rôles et permissions

Source unique de vérité : `packages/shared/src/permissions.ts` (importé par le serveur **et** l'interface). Le serveur est seul juge ; l'interface masque seulement ce qui est interdit.

## 1. Niveaux

| Code | Niveau | Signification |
| --- | --- | --- |
| `-` | 0 | Aucun accès (module absent du menu, API → 403) |
| `L` | 1 | Lecture seule |
| `E` | 2 | Lecture + écriture |
| `V` | 3 | Écriture + **validation** (remises, annulations, offerts, écarts, dérogations) |

`can(user, module, niveau)` ⇔ `niveauEffectif(user, module) >= niveau`.
Niveau effectif = matrice par défaut du rôle, **surchargée** par `users.permissions` (JSON `{ module: niveau }`) éditable par l'ADMIN (écran Utilisateurs → Droits fins).

## 2. Matrice par défaut

| Module (clé) | ADMIN | DIRECTEUR | RECEPTIONNISTE | AUDITEUR_NUIT | GOUVERNANTE | TECHNICIEN | RESP_SERVICE | CAISSIER_POS | MAGASINIER | COMPTABLE | RESP_GROUPE |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `chambres` Chambres et planning | V | E | E | E | L | L | L | - | - | - | L |
| `clients` Clients, fiche de police | V | E | E | E | - | - | - | - | - | L | L |
| `groupes` Groupes et séminaires | V | V | E | L | - | - | - | - | - | L | E |
| `reservations` Réservations | V | V | E | E | - | - | - | - | - | L | E |
| `folios` Folios, factures, paiements | V | V | E | E | - | - | L | - | - | L | L |
| `pos` Caisse POS | V | V | - | E | - | - | V | E | - | L | - |
| `stocks` Stocks et achats | V | V | - | - | L | - | E | - | E | L | - |
| `housekeeping` Housekeeping | V | L | L | L | E | - | - | - | - | - | - |
| `maintenance` Maintenance | V | L | E | E | E | E | E | - | - | - | - |
| `objets` Objets trouvés | V | L | E | E | E | - | - | - | - | - | - |
| `main_courante` Main courante | V | E | E | E | E | E | E | - | - | L | - |
| `caisse` Clôture de caisse | V | V | E | E | - | - | E | E | - | L | - |
| `audit` Audit de nuit | V | V | L | E | - | - | - | - | - | L | - |
| `tarifs` Tarifs, saisons, prestations | V | E | L | L | - | - | - | - | - | L | L |
| `compta` Comptabilité et fiscalité | V | V | - | - | - | - | - | - | - | E | - |
| `rapports` Rapports | V | E | L | L | - | - | L | - | L | E | L |
| `admin` Utilisateurs, postes, paramètres | V | L | - | - | - | - | - | - | - | - | - |

## 3. Règles particulières

- **Liste noire et pièces d'identité** : visibles uniquement par ADMIN, DIRECTEUR, RECEPTIONNISTE, AUDITEUR_NUIT (les autres rôles reçoivent `liste_noire=0`, `piece_scan=null`).
- **Registre de police** : réception et direction seulement ; chaque consultation est tracée.
- **Maintenance / main courante** : l'écriture de base se limite à la création ; seuls l'auteur, le technicien affecté ou un responsable font évoluer un ticket.
- **Passage d'une chambre à PROPRE** : GOUVERNANTE, DIRECTEUR, ADMIN.
- **Réouverture d'une journée clôturée** : ADMIN uniquement, motif obligatoire, seulement la dernière journée et si aucune opération n'a été saisie depuis.
- **Session de caisse** : seul son titulaire la clôture (ou un niveau V) ; l'attendu n'est visible qu'après clôture (comptage à l'aveugle).
- **Paramètres fiscaux** : ADMIN ou niveau V en comptabilité.
- Un ADMIN ne peut ni se désactiver ni se rétrograder lui-même.

## 4. Validation par un responsable (sans changer d'utilisateur)

```ts
// apps/server/src/core/permissions.ts
requireValidation(req, module, libelleAction): User
```

1. Si l'utilisateur connecté a le niveau `V` sur le module → validé (lui-même).
2. Sinon, le corps de la requête doit contenir `validation: { login, secret }` (PIN ou mot de passe d'un responsable) ; sinon **HTTP 428 `VALIDATION_RESPONSABLE`**.
3. Le valideur doit être actif, non verrouillé, avec `V` sur le module ; sinon 403.
4. Trace `audit_log` : `VALIDATION_RESPONSABLE` avec valideur et action.

Côté interface, `api/client.ts` intercepte le 428 : il ouvre `ValidationDialog` (« Validation d'un responsable requise : Remise ») avec login + PIN, puis rejoue **la même requête** avec `validation`.

Actions soumises à validation : remise (réservation, POS), annulation de ligne de folio, annulation de paiement, remboursement, avoir, régularisation, réimputation vers/depuis un compte collectif, arbitrage d'un litige, clôture forcée, check-out forcé, offert, annulation d'un article envoyé en cuisine ou d'un ticket encaissé, annulation sans pénalité, no-show sans pénalité, réservation ou check-in d'un client en liste noire, dérogation pièce d'identité, dépassement du plafond de crédit, écart de caisse.

## 5. Tests exigés

- Un test par rôle vérifiant 3 accès autorisés et 3 refusés (403).
- Test du flux 428 → rejeu avec validation → succès + trace d'audit.
- Test de surcharge de permission (un réceptionniste avec `compta: 'L'`).
