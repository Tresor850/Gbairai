#!/usr/bin/env bash
# Exit on error
set -e

echo "🚀 Début du build de production pour Laravel..."

# 1. Install dependencies
composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction

# 2. Cache configuration, routes, and views for speed
echo "⚡ Optimisation du cache Laravel..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 3. Run database migrations safely
echo "🗄️ Exécution des migrations de base de données..."
php artisan migrate --force

echo "✅ Build Laravel terminé avec succès !"
