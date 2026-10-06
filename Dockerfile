# Image Nginx officielle : elle est multi-architecture et fonctionne donc
# aussi bien sur Raspberry Pi (ARM) que sur les machines x86 classiques.
FROM nginx:alpine

# Nom DNS Docker et port interne du service back-end ; Compose peut les remplacer.
ENV API_HOST=api \
    API_PORT=8000 \
    NGINX_ENVSUBST_TEMPLATE_DIR=/etc/nginx/templates \
    NGINX_ENVSUBST_TEMPLATE_SUFFIX=.template \
    NGINX_ENVSUBST_FILTER=^(API_HOST|API_PORT)$

# Copie les pages et ressources du front-end dans le répertoire servi par Nginx.
COPY index.html board.html register.html /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/assets/

# Nginx transformera ce modèle au démarrage pour y inscrire le nom et le port
# du service back-end indiqués dans l'environnement Docker.
COPY docker/default.conf /etc/nginx/templates/default.conf.template

# Le conteneur écoute sur le port HTTP 80, à publier derrière Caddy.
EXPOSE 80