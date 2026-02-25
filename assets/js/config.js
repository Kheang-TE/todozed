/**
 * Configuration globale de l'application Todozed
 * 
 * Ce fichier centralise l'URL de l'API.
 * - En local (localhost) → utilise l'API locale
 * - En production (Vercel) → utilise l'API Railway
 */

const AppConfig = (() => {

    // Détection automatique de l'environnement
    const isLocal = window.location.hostname === 'localhost' 
                 || window.location.hostname === '127.0.0.1';

    const API_URL = isLocal
        ? 'http://localhost:8000/api'   // URL locale (développement)
        : '__API_URL__';                // Remplacé automatiquement par Vercel au déploiement

    return {
        API_URL
    };

})();
