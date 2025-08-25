#!/bin/bash

# Install all dependencies including devDependencies
npm install --include=dev

# Build the project
npx vite build && npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist