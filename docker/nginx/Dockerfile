# Production nginx image.
# Copies Vite-built static assets from the app image at build time.
# IMPORTANT: build the app image first — docker compose build app — then build nginx.
#
# APP_IMAGE must match the app image name, which docker compose derives from the
# project directory (e.g. saas-template-app). Override it if you rename either:
#   docker compose -f docker-compose.prod.yml build --build-arg APP_IMAGE=my-app:latest nginx
ARG APP_IMAGE=saas-template-app:latest

FROM ${APP_IMAGE} AS app

FROM nginx:1.27-alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY docker/nginx/default.conf   /etc/nginx/conf.d/default.conf
COPY docker/nginx/blocklist.conf /etc/nginx/blocklist.conf

# default.conf logs suspicious requests here. Created so nginx starts even when
# no named volume is mounted over it.
RUN mkdir -p /var/log/nginx/scanner

# Bake static assets into this image so nginx can serve them without a shared volume.
COPY --from=app /var/www/html/public /var/www/html/public
