#!/usr/bin/env bash
set -e

# Dynamically adjust Apache port if Render provides a $PORT environment variable
PORT="${PORT:-80}"
sed -i "s/Listen 80/Listen ${PORT}/g" /etc/apache2/ports.conf
sed -i "s/<VirtualHost \*:80>/<VirtualHost \*:${PORT}>/g" /etc/apache2/sites-available/000-default.conf

# Clear old build-time caches to ensure runtime environment variables are read
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Run database migrations
echo "🗄️ Exécution des migrations..."
php artisan migrate --force || true

# Start Apache in foreground
exec apache2-foreground
