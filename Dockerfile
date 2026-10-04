# =============================================================================
# Dockerfile - Frontend vanilla (todozed) en PRODUCTION
# -----------------------------------------------------------------------------
# Le frontend est 100% statique (HTML/CSS/JS), SANS étape de build ni Node.js.
# On se contente de copier les fichiers dans nginx, qui :
#   1. sert les fichiers statiques (index.html, board.html, register.html...)
#   2. reverse-proxy les requêtes /api vers le conteneur backend "api"
#
# Le serveur distant ne compile rien : tout est dans ces quelques lignes.
# =============================================================================

# syntax=docker/dockerfile:1

FROM nginx:1.27-alpine

# --- Copier les fichiers statiques -------------------------------------------
# On copie les 3 pages HTML directement dans la racine servie par nginx.
COPY index.html register.html board.html /usr/share/nginx/html/

# Puis le dossier assets/ (css + js) en conservant la même arborescence.
COPY assets/ /usr/share/nginx/html/assets/

# --- Remplacer la configuration nginx par défaut -----------------------------
# Notre config sert les statiques ET proxifie /api vers le backend.
COPY docker/default.conf /etc/nginx/conf.d/default.conf

# Port HTTP interne (publié sur l'hôte via docker-compose)
EXPOSE 80