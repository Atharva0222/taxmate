#!/bin/bash

# Build script for Render deployment
echo "Starting build process..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building application..."
npm run build

# Run database migrations
echo "Running database migrations..."
tsx server/migrate.ts || echo "Migration might have already been applied"

echo "Build complete!"