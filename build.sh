#!/bin/bash

# Build script for Render deployment
echo "Starting build process..."

# Install dependencies (including dev dependencies needed for build)
echo "Installing dependencies..."
npm ci || npm install

# Verify vite is installed
echo "Checking for vite..."
npx vite --version || (echo "Vite not found, installing..." && npm install vite)

# Build the application
echo "Building application..."
npx vite build && npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Check if dist folder was created
if [ ! -d "dist" ]; then
  echo "Error: dist folder not created during build"
  exit 1
fi

# List contents of dist folder for debugging
echo "Contents of dist folder:"
ls -la dist/

# Run database migrations
echo "Running database migrations..."
npx tsx server/migrate.ts || echo "Migration might have already been applied"

echo "Build complete!"