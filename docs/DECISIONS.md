# Journal des décisions (ADR)

Format : contexte → décision → conséquences. Toute décision qui modifie la stack, l'architecture ou une règle métier par défaut ajoute une entrée ici **avant** d'être codée.

## ADR-001 — SQLite embarquée plutôt que PostgreSQL (26/09/2026)

- **Contexte** : le CDC v2.1 prévoyait PostgreSQL 16 ; le produit doit être « prêt à l'emploi » (installation en une journée, sans configuration de base).
- **Décision** : SQLite (`better-sqlite3`, WAL, `synchronous=FULL`) ouverte **uniquement** par le processus serveur ; accès des postes exclusivement via l'API.
- **Conséquences** : aucun logiciel tiers à installer ; sauvegarde en ligne simple (`db.backup`). Charge visée (10 postes, 100 chambres, 10 ans) largement dans les capacités de SQLite. Schéma Drizzle écrit pour rester portable vers PostgreSQL (pas de fonctions SQLite exotiques dans les services). Point à reconfirmer par TIAF (CDC §11).

## ADR-002 — Un seul installateur, mode serveur/client au premier lancement

- **Contexte** : le CDC v2.1 prévoyait deux installateurs (serveur = service Windows, client).
- **Décision** : un seul `.exe` ; le serveur tourne dans le processus principal Electron du poste serveur, lancé avec Windows et maintenu dans la zone de notification.
- **Conséquences** : installation simplifiée ; le serveur dépend d'une session Windows ouverte. Option ultérieure : `apps/server` exécutable seul comme service Windows (NSSM/`node-windows`) sans changement de code (`start({ dataDir, port })`).

## ADR-003 — Drizzle ORM plutôt que Prisma

- **Contexte** : Prisma embarque un moteur binaire délicat à empaqueter dans Electron et gère mal `better-sqlite3` synchrone.
- **Décision** : Drizzle (`drizzle-orm/better-sqlite3`) + migrations SQL versionnées.
- **Conséquences** : transactions synchrones natives ; triggers et index partiels écrits dans des migrations SQL manuelles.

## ADR-004 — HTTP en clair sur le LAN en L0, HTTPS local en L7

- **Contexte** : ENF-09 exige des communications chiffrées ; un certificat local complique l'installation.
- **Décision** : L0–L6 en HTTP sur le réseau du personnel isolé ; L7 : certificat auto-signé généré à l'installation, empreinte épinglée par la coque Electron (`setCertificateVerifyProc`).
- **Conséquences** : exigence ENF-09 satisfaite à la livraison ; la tablette navigateur devra accepter le certificat une fois.

## ADR-005 — L'interface est servie par le serveur

- **Décision** : les postes clients chargent l'interface web depuis `http://<serveur>:4580` ; la coque Electron ne contient que `setup.html`, `offline.html` et le preload.
- **Conséquences** : mise à jour du serveur = mise à jour de tous les postes ; version d'interface toujours compatible avec l'API. Mode dégradé limité à la liste des présents en cache.

## ADR-006 — Factures annulées uniquement par avoir total

- **Décision** : un avoir annule la facture entière et rouvre le folio ; la correction partielle = avoir total + nouvelle facture.
- **Conséquences** : simplicité et conformité ; pas d'avoir partiel ligne à ligne en v2.0.

## ADR-007 — Folio technique par point de vente

- **Décision** : les ventes POS payées immédiatement sont postées sur un folio `POS` par point de vente (lignes + paiements), ce qui unifie la base des écritures comptables et des rapports de CA.

## À décider

- [ ] Hôtel pilote et paramètres fiscaux réels (TVA, taxe de séjour).
- [ ] Transmission DGI (facture normalisée) : format et API.
- [ ] Format d'export comptable exact (Sage 100 ? autre).
- [ ] Modèle de licence.
