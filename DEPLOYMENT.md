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
chmod +x render-build.sh && ./render-build.sh
```

**Start Command:**
```bash
node dist/index.js
```

Or alternatively, use the provided `render.yaml` file for automatic configuration.

### 3. Environment Variables ⚠️ CRITICAL FOR 502 ERROR FIX

**Missing environment variables are the most common cause of 502 errors on Render.**

Ensure these environment variables are set in your Render dashboard:

1. **SESSION_SECRET** (REQUIRED - Often missing!)
   - Generate a secure secret: `openssl rand -base64 32`
   - Example: `xKj9!mP2$qR5&vN8#bL3^fH6*wE1@zC4`
   - **Without this, authentication will fail with 502 errors**

2. **NODE_ENV** 
   - Must be set to: `production`
   - This enables SSL for database connections

3. **DATABASE_URL** 
   - Automatically provided by Render PostgreSQL
   - Format: `postgresql://username:password@host:port/database`

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