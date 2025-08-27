#!/bin/bash

# Render-specific build script
echo "=== Starting Render build process ==="

# Ensure we're in the right directory
pwd
ls -la

# Install ALL dependencies (including devDependencies)
echo "=== Installing dependencies with devDependencies ==="
NODE_ENV=development npm install

# Direct build using npx to ensure tools are found
echo "=== Building frontend with Vite ==="
npx vite build

echo "=== Building backend with esbuild ==="
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Verify dist folder exists
if [ -d "dist" ]; then
  echo "=== Build successful, dist folder contents: ==="
  ls -la dist/
else
  echo "=== Build failed: dist folder not created ==="
  exit 1
fi

# Run database migrations
echo "=== Running database migrations ==="
npx tsx server/migrate.ts || echo "Note: Migration may have already been applied"

echo "=== Build complete! ==="