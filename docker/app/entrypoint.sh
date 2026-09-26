#!/bin/sh
set -e

ROLE="${CONTAINER_ROLE:-app}"

case "$ROLE" in
  app)
    chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

    # Probe with PHP's own pdo_mysql rather than a CLI client: it is the exact
    # driver the app connects with, and it keeps a MySQL client package out of
    # the image (Alpine's "mysql-client" is MariaDB's client, not MySQL's).
    echo "[entrypoint] Waiting for database..."
    until php -r '
        try {
            new PDO(
                sprintf("mysql:host=%s;port=%s", getenv("DB_HOST"), getenv("DB_PORT") ?: "3306"),
                getenv("DB_USERNAME"),
                getenv("DB_PASSWORD")
            );
        } catch (Throwable $e) {
            exit(1);
        }
    ' 2>/dev/null; do
      sleep 1
    done

    echo "[entrypoint] Running migrations..."
    php artisan migrate --force

    echo "[entrypoint] Optimizing..."
    php artisan optimize

    echo "[entrypoint] Starting PHP-FPM..."
    exec php-fpm
    ;;

  queue)
    echo "[entrypoint] Starting queue worker..."
    exec php artisan queue:work \
      --sleep=3 \
      --tries=3 \
      --max-time=3600 \
      --memory=256
    ;;

  scheduler)
    echo "[entrypoint] Starting scheduler..."
    while true; do
      php artisan schedule:run --verbose --no-interaction
      sleep 60
    done
    ;;

  skip)
    # One-off commands: docker compose run --rm -e CONTAINER_ROLE=skip app php artisan ...
    # Recreate subdirs that a tmpfs mount would wipe.
    mkdir -p storage/framework/views storage/framework/sessions storage/framework/cache/data storage/framework/testing bootstrap/cache
    touch .env
    exec "$@"
    ;;

  *)
    echo "[entrypoint] Unknown CONTAINER_ROLE: $ROLE"
    exit 1
    ;;
esac
