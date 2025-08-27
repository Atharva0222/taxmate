# Deployment Instructions for Render

## Important: Build Output Location

The application builds to the `dist` folder in the project root, not `/src/dist`.

## Database Setup

This application uses Render's PostgreSQL database (NOT Neon serverless database).

### 1. Database Configuration

Make sure your Render PostgreSQL database is properly configured:
- The `DATABASE_URL` environment variable should be automatically set by Render
- The database uses standard PostgreSQL connection (not serverless)

### 2. Build Configuration on Render

Set the following in your Render dashboard:

**Build Command:**
```bash
chmod +x build.sh && ./build.sh
```

**Start Command:**
```bash
node dist/index.js
```

Or alternatively, use the provided `render.yaml` file for automatic configuration.

### 3. Environment Variables

Ensure these environment variables are set in Render:

- `DATABASE_URL` - Automatically provided by Render PostgreSQL
- `SESSION_SECRET` - A secure random string for session encryption
- `NODE_ENV` - Set to "production"

### 4. Database Migration

The migration will run automatically during the build process via `build.sh`.

If you need to run migrations manually, you can run:
```bash
tsx server/migrate.ts
```

### 5. Important Notes

- This application uses standard PostgreSQL with the `pg` driver
- SSL is automatically configured for production connections
- The Neon serverless driver has been completely removed
- Database tables will be created automatically on first deployment

### 6. Troubleshooting

If you see "relation does not exist" errors:
1. Check that the migration ran successfully in the build logs
2. Verify the DATABASE_URL is pointing to your Render PostgreSQL instance
3. Manually run the migration script if needed

### 7. Database Schema

The application creates the following tables:
- `users` - User accounts with authentication
- `sessions` - Session storage for authentication
- `tax_sessions` - Tax filing sessions with progress tracking
- `form16_uploads` - Form 16 document uploads and processing status