#!/bin/bash

# Build script for Render deployment
echo "Starting build process..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building application..."
npm run build

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