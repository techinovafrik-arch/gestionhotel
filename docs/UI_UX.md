# Interface et expérience utilisateur

Public : personnel hôtelier **peu familier de l'informatique**. Priorités : lisible, rapide, impossible de se tromper sur l'argent.

## 1. Principes

1. **Français** partout, vocabulaire du métier (folio, nuitée, main courante), jamais de jargon technique.
2. Action principale en **un ou deux clics** ; boutons d'action nommés par un verbe (« Faire le check-in », « Encaisser », « Transférer sur la chambre »).
3. **Toujours dire pourquoi** une action est refusée et quoi faire : afficher le `message` de l'API tel quel (il est rédigé pour l'utilisateur).
4. États vides utiles : « Aucune arrivée prévue aujourd'hui — Nouvelle réservation ».
5. Montants toujours formatés `12 500 FCFA` (espace fine insécable), alignés à droite, en chiffres tabulaires.
6. Dates `26/09/2026`, heures `14:05`. La **date d'exploitation** est affichée en permanence dans l'en-tête (différente de la date du jour après minuit).
7. Confirmation obligatoire avant toute action irréversible (check-out, facture, avoir, clôture de caisse, étape d'audit) avec récapitulatif des montants.
8. Temps réel : pas de bouton « actualiser » ; les listes se mettent à jour seules. Un conflit (409) affiche « Modifié par un autre poste — données rechargées ».

## 2. Mise en page

- Barre latérale gauche : modules autorisés au rôle, groupés (Réception · Restauration · Étages · Gestion · Administration). Repliable.
- En-tête : nom de l'hôtel, **date d'exploitation**, bouton « Ma caisse » (état de la session : ouverte/fermée + fond), notifications (cloche), utilisateur (changer d'utilisateur par PIN, mot de passe, déconnexion), bascule mode sombre, taille du texte (A− / A+).
- Contenu : titre de page + actions à droite, filtres, puis tableau ou tableau de bord.
- Largeur minimale 1366 px ; la caisse POS et l'écran Étages sont utilisables sur écran tactile 15" et tablette 10".

## 3. Design system (`apps/web/src/styles/tokens.css`)

| Jeton | Clair | Sombre | Usage |
| --- | --- | --- | --- |
| `--bg` | `#f6f7f9` | `#0f1115` | fond |
| `--surface` | `#ffffff` | `#181b21` | cartes, tableaux |
| `--text` / `--text-muted` | `#111827` / `#6b7280` | `#e5e7eb` / `#9ca3af` | texte |
| `--primary` | `#1d4ed8` | `#60a5fa` | action principale |
| `--success` / `--warning` / `--danger` | `#15803d` / `#b45309` / `#b91c1c` | `#4ade80` / `#fbbf24` / `#f87171` | statuts |
| `--border` | `#e5e7eb` | `#2a2f38` | séparateurs |

Police système (Segoe UI sous Windows), aucune police téléchargée. Base 14 px, réglable 12–18 px. Rayon 8 px. Cibles tactiles ≥ 44 px sur POS et Étages.

Couleurs d'état des chambres (identiques dans le planning, le plan des étages et la réception) :

| État | Couleur |
| --- | --- |
| Libre et propre | vert |
| Libre et sale / en cours / à contrôler | orange (avec pastille d'entretien) |
| Réservée (arrivée du jour) | bleu clair |
| Occupée | bleu |
| Départ du jour | violet |
| Hors service | gris hachuré |
| Groupe | bordure pointillée de la couleur du statut |

## 4. Composants communs

`Button` (primaire, secondaire, danger, fantôme) · `Input`, `Select`, `DateInput`, `MoneyInput` (entiers, séparateur de milliers) · `DataTable` (tri, filtre, pagination client, export Excel) · `Modal`, `ConfirmDialog` · **`ValidationDialog`** (login + PIN responsable, rejoue la requête après 428) · `Badge` statut · `Tabs` · `EmptyState` · `Toast` · `ClientPicker` (recherche + création rapide + alerte doublon + alerte liste noire) · `RoomPicker` (disponibilités + caractéristiques) · `PaymentForm` (lignes multi-modes, opérateur et référence Mobile Money, calcul du rendu) · `PrintButton` (A4 / ticket / PDF).

## 5. Écrans par rôle (page d'accueil = tableau de bord du rôle)

| Rôle | Accueil | Écrans principaux |
| --- | --- | --- |
| Réceptionniste | Arrivées / départs / présents du jour, chambres prêtes, consignes non lues | Planning, Réservations, Walk-in, Check-in, Check-out, Clients, Folios, Ma caisse |
| Auditeur de nuit | Assistant d'audit (étape courante), main courante | Audit de nuit, Réception, Main courante, Caisse |
| Gouvernante | Plan des étages (grille de chambres colorées), tâches par employée | Étages, Plan du jour, Minibar, Linge, Objets trouvés |
| Technicien | Tickets ouverts par priorité | Maintenance, Préventive, Historique |
| Caissier POS | Écran de caisse plein écran | POS (tables, articles, ticket, encaissement), Ma caisse |
| Resp. service | Ventes du jour, tickets ouverts, alertes stock | POS, Carte et articles, Fiches techniques, Inventaires, Ticket Z |
| Magasinier | Alertes stock minimum et péremption | Articles, Niveaux, Mouvements, Bons de commande, Réceptions, Inventaires |
| Comptable | État des journées clôturées | Écritures, Journaux, TVA, Taxe de séjour, Balance âgée, Périodes, Exports |
| Resp. groupes | Groupes à venir, règles à faire signer | Groupes, Salles de séminaire, Proformas |
| Directeur | KPI (occupation, ADR, RevPAR, CA, encaissements), validations en attente | Rapports, Validations d'écarts, Journal d'audit |
| Admin | Diagnostic (sauvegarde, disque, postes connectés) | Paramètres, Utilisateurs, Postes, Chambres, Tarifs, Prestations, Sauvegardes |

## 6. Écrans clés (détail)

- **Planning** : grille chambres (lignes, groupées par étage) × jours (14/30/60 colonnes), barre par réservation avec nom et couleur de statut ; clic sur case vide → nouvelle réservation pré-remplie ; glisser-déposer d'une réservation non arrivée (contrôle serveur, retour en place si refus) ; colonne « non attribuées » ; aujourd'hui surligné.
- **Check-in** : récapitulatif réservation, formulaire fiche de police par occupant majeur (pré-rempli depuis la fiche client, champs obligatoires marqués), caution (montant + mode), bouton désactivé tant que la fiche est incomplète, impression de la fiche pour signature.
- **Check-out** : anomalies en haut (tickets POS ouverts, linge en cours, départ anticipé), relevé du folio, supplément de départ tardif pré-coché selon l'heure, caution (restituer / convertir), `PaymentForm`, choix « compte entreprise », bouton « Encaisser et facturer » → facture affichée prête à imprimer.
- **Folio** : lignes (date, désignation, origine, montant, info d'imputation en sous-ligne, facture), paiements, solde en grand, actions (ajouter prestation, encaisser, caution, transférer des lignes, litige, facturer, relevé imprimable).
- **Groupe** : onglets Dossier · Chambres et membres (import rooming list) · Règles (éditeur ligne par ligne, modèles, simulation d'une journée type, statut et historique des versions, signature) · Compte collectif · Relevés · Salles.
- **POS** : colonne gauche plan de salle / commandes ouvertes, centre grille de catégories colorées puis articles (gros boutons), droite ticket en cours (quantités ±, commentaire), barre d'actions : Envoyer, Remise, Offrir, Diviser, Encaisser, Transférer sur chambre, Annuler. Champ code-barres toujours focalisé.
- **Audit de nuit** : stepper 1→8, chaque étape affiche ses données et un seul bouton « Valider l'étape » ; étapes passées en lecture avec leur journal.
- **Ma caisse** : ouvrir (fond), mouvements, clôturer (saisie à l'aveugle par mode, puis affichage des écarts, justification si seuil dépassé), ticket Z, versement.

## 7. Impression (gabarits `apps/web/src/print/`)

| Document | Format |
| --- | --- |
| Facture / avoir | A4, en-tête hôtel + mentions légales, tableau par famille, HT/TVA/taxe/TTC, paiements, empreinte abrégée en pied |
| Relevé de folio, relevé de groupe | A4 |
| Fiche de police, registre des voyageurs | A4 |
| Ticket de caisse, ticket de transfert à signer, ticket Z | 80 mm |
| Bon de préparation cuisine / bar | 80 mm, gros caractères, table et heure |
| Rapport journalier, liste des présents (évacuation) | A4 |
| Récapitulatif des règles de groupe à signer | A4, langage clair + exemple chiffré |

## 8. Accessibilité et confort

Contraste AA, navigation clavier complète à la réception (raccourcis : `F2` recherche client, `F3` nouvelle réservation, `F4` walk-in, `F8` encaisser, `Échap` fermer), focus visible, mode sombre pour la nuit, verrouillage d'écran après inactivité, aide contextuelle (icône « ? » ouvrant la fiche d'aide de l'écran).
