# Render Deployment Fix

## Issue
The application fails to start on Render with error: `Cannot find module '/opt/render/project/src/dist/index.js'`

## Solution

### Option 1: Manual Configuration in Render Dashboard (RECOMMENDED)

1. **Build Command:**
   ```bash
   chmod +x render-build.sh && ./render-build.sh
   ```
   OR if that doesn't work:
   ```bash
   NODE_ENV=development npm install && npx vite build && npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist && npx tsx server/migrate.ts
   ```

2. **Start Command:**
   ```bash
   node dist/index.js
   ```
   (NOT `npm start` - this is important!)

3. **Environment Variables:**
   - `NODE_ENV`: production
   - `SESSION_SECRET`: (click Generate Random String)
   - `DATABASE_URL`: (automatically provided by Render PostgreSQL)

### Option 2: Use render.yaml (Recommended)

Push the included `render.yaml` file to your repository. Render will automatically detect it and configure everything correctly.

### Option 3: Update package.json Start Script

If you must use `npm start`, you'll need to manually edit package.json to change:
```json
"start": "NODE_ENV=production node dist/index.js"
```

## Database Migration

The migration will run automatically if you use the build.sh script. If tables aren't created, you can run manually:

```bash
npx tsx server/migrate.ts
```

## Verification

After deployment, check:
1. Build logs show "✅ Database migration completed successfully!"
2. The dist folder contains index.js
3. The application starts without MODULE_NOT_FOUND errors

## Common Issues

1. **Tables don't exist**: Migration didn't run - check build logs
2. **Module not found**: Build didn't complete - check build command
3. **Authentication fails**: SESSION_SECRET not set - add to environment variables