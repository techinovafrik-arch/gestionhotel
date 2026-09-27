// Types, schémas Zod et constantes partagés entre le serveur et l'interface.
// Contenu métier (rôles, permissions, money, dates, codes d'erreur) : lot L0.2.

export const APP_NAME = 'Hotel Manager';

/** Port HTTP + Socket.IO du serveur (docs/ARCHITECTURE.md §1). */
export const API_PORT = 4580;

/** Port UDP de découverte du serveur sur le LAN (docs/ARCHITECTURE.md §7). */
export const DISCOVERY_PORT = 4581;
