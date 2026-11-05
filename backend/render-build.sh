#!/usr/bin/env bash
set -e

echo "🚀 Installation des dépendances Composer..."
composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction

echo "🧹 Nettoyage des caches..."
php artisan config:clear
php artisan route:clear
php artisan view:clear

echo "✅ Build terminé !"
