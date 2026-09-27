# Build, installation, mises à jour et licence

## 1. Build

```bash
pnpm --filter web build            # → apps/web/dist (servi par le serveur)
pnpm --filter server build         # → apps/server/dist (tsc ou tsup, CommonJS)
pnpm --filter desktop dist         # electron-builder --win nsis --x64
```

`electron-builder.yml` (apps/desktop) :

```yaml
appId: ci.tiaf.hotelmanager
productName: Hotel Manager
directories: { output: ../../dist }
files: ["dist/**", "node_modules/**", "package.json"]
extraResources:
  - { from: ../web/dist, to: web }
  - { from: ../server/dist, to: server }
  - { from: ../server/src/db/migrations, to: migrations }
asarUnpack: ["**/node_modules/better-sqlite3/**"]
win: { target: [{ target: nsis, arch: [x64] }], icon: build/icon.ico }
nsis:
  oneClick: false
  perMachine: true
  allowToChangeInstallationDirectory: true
  createDesktopShortcut: true
  include: build/installer.nsh
```

- `better-sqlite3` doit être recompilé pour l'ABI d'Electron : `electron-builder install-app-deps` (ou prébuild `electron-v<ABI>-win32-x64`). Vérifier au premier build CI.
- Signature de code : certificat Authenticode TIAF (variables `CSC_LINK`, `CSC_KEY_PASSWORD`). Sans signature, SmartScreen avertit : prévoir la procédure dans le guide.
- Build Windows recommandé sur une machine Windows ou GitHub Actions `windows-latest`.

## 2. `build/installer.nsh`

```nsis
!macro customInstall
  CreateDirectory "$COMMONAPPDATA\HotelManager"
  AccessControl::GrantOnFile "$COMMONAPPDATA\HotelManager" "(S-1-5-32-545)" "FullAccess"
  nsExec::Exec 'netsh advfirewall firewall add rule name="Hotel Manager API" dir=in action=allow protocol=TCP localport=4580 profile=private'
  nsExec::Exec 'netsh advfirewall firewall add rule name="Hotel Manager Decouverte" dir=in action=allow protocol=UDP localport=4581 profile=private'
!macroend
!macro customUnInstall
  nsExec::Exec 'netsh advfirewall firewall delete rule name="Hotel Manager API"'
  nsExec::Exec 'netsh advfirewall firewall delete rule name="Hotel Manager Decouverte"'
  ; les données de ProgramData\HotelManager ne sont JAMAIS supprimées à la désinstallation
!macroend
```

## 3. Premier lancement

1. `setup.html` : « Ce poste est-il le serveur de l'hôtel ? » → **Serveur** ou **Poste client**.
2. Serveur : démarrage du serveur embarqué (données `C:\ProgramData\HotelManager`), auto-lancement avec Windows (`app.setLoginItemSettings`), icône dans la zone de notification ; la fermeture de la fenêtre ne coupe pas le serveur (« Quitter » dans le menu de l'icône, avec confirmation).
3. Client : recherche UDP (3 s) → liste des serveurs trouvés, ou saisie de l'IP → test `/api/health` → enregistrement du poste → message « En attente d'approbation par l'administrateur ».
4. Si aucun utilisateur n'existe : assistant de premier démarrage (`/setup`).

Prérequis vérifiés : Windows 64 bits, 2 Go libres, avertissement si l'IP du serveur est en DHCP (conseiller une IP fixe ou une réservation DHCP).

## 4. Mises à jour

- Installer la nouvelle version **sur le serveur** : au démarrage, sauvegarde automatique `hotel_avant-migration_<version>.db`, puis migrations Drizzle ; échec → restauration automatique de la sauvegarde et message.
- Les postes clients chargent l'interface depuis le serveur : rien à faire pour l'interface. Si la coque Electron du client est trop ancienne (`X-Client-Version` < minimum déclaré par le serveur), écran « Mettez ce poste à jour » avec lien vers l'installateur déposé dans `\\SERVEUR\HotelManager-Installation` (partage lecture seule optionnel) ou téléchargé depuis le serveur (`GET /installateur`).
- Retour arrière : réinstaller la version précédente + restaurer `hotel_avant-migration_*.db`.

## 5. Sauvegardes (paramétrage à l'installation)

1. Choisir le dossier de copie externe (second disque, NAS `\\NAS\hotel`, ou clé USB).
2. Définir la clé de chiffrement (remise sous pli à la direction).
3. Lancer une sauvegarde manuelle puis **tester une restauration** (procédure du guide, < 1 h).

## 6. Licence (lot L7)

- Fichier `licence.hml` signé (Ed25519, clé publique embarquée) : établissement, nombre de postes, date d'expiration du support, modules.
- Activation hors ligne : l'ADMIN importe le fichier dans Administration → Licence.
- Au-delà du nombre de postes, l'approbation d'un nouveau poste est refusée avec un message clair.
- Sans licence : mode évaluation 30 jours, bandeau permanent.

## 7. Diagnostic et support

- Administration → Diagnostic : version, uptime, taille de la base, espace disque (alerte < 15 %), dernière sauvegarde, postes connectés, `PRAGMA quick_check`, adresses IP du serveur.
- Bouton « Exporter les journaux » (`serveur.log`, rotation 5 Mo) pour le support TIAF.

## 8. Guide d'installation à livrer (`docs/guides/installation.md`, lot L7)

Prérequis matériels et réseau · installation du serveur · IP fixe · pare-feu · installation des postes · approbation · imprimantes par poste · sauvegardes et test de restauration · mise à jour · dépannage (serveur introuvable, poste non approuvé, SmartScreen, imprimante).
