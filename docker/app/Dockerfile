# ── Stage 1: PHP-FPM base (shared between test and prod) ────────────────────
FROM php:8.4-fpm-alpine AS php-base

# System deps
RUN apk add --no-cache \
    libpng-dev libjpeg-turbo-dev freetype-dev \
    libzip-dev \
    icu-dev icu-libs \
    git unzip oniguruma-dev

# PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
 && docker-php-ext-configure intl \
 && docker-php-ext-install \
      pdo_mysql \
      bcmath mbstring pcntl exif \
      gd zip intl

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /var/www/html

# ── Stage 3: Test image (with dev deps, no asset bake) ──────────────────────
FROM php-base AS test

COPY composer.json composer.lock ./
RUN composer install \
      --optimize-autoloader \
      --no-interaction \
      --no-scripts \
      --prefer-dist

COPY . .

RUN chown -R www-data:www-data storage bootstrap/cache \
 && chmod -R 775 storage bootstrap/cache

COPY docker/app/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 9000
ENTRYPOINT ["/entrypoint.sh"]

# ── Stage 4: PHP-FPM production image ───────────────────────────────────────
FROM php-base AS app

# Install PHP deps first (layer-cached until composer.lock changes)
COPY composer.json composer.lock ./
RUN composer install \
      --no-dev \
      --optimize-autoloader \
      --no-interaction \
      --no-scripts \
      --prefer-dist

# Copy full application (public/build/ is built locally by deploy.py/build.sh
# before docker build runs, so VITE_ env vars are correctly embedded).
COPY . .

# Production PHP config
COPY docker/app/php-prod.ini /usr/local/etc/php/conf.d/php-prod.ini

# storage/ and bootstrap/cache/ must be writable by PHP-FPM
RUN chown -R www-data:www-data storage bootstrap/cache \
 && chmod -R 775 storage bootstrap/cache

COPY docker/app/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 9000
ENTRYPOINT ["/entrypoint.sh"]


