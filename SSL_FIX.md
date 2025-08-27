# SSL/TLS Fix for Render Deployment

## Problem
The error `SSL/TLS required` occurs when the PostgreSQL session store tries to connect without SSL in production.

## Solution Applied
Modified `/server/auth.ts` to automatically append `?sslmode=require` to the database connection string when running in production.

## Code Changes
```javascript
// For production, append SSL to connection string if not present
let connectionString = process.env.DATABASE_URL!;
if (process.env.NODE_ENV === 'production' && !connectionString.includes('sslmode=')) {
  connectionString += connectionString.includes('?') ? '&sslmode=require' : '?sslmode=require';
}
```

## Required Environment Variables on Render
1. **NODE_ENV** = `production` (REQUIRED for SSL to work)
2. **SESSION_SECRET** = `<your-secure-secret>`
3. **DATABASE_URL** = (automatically set by Render)

## Deployment Steps
1. Push this code to your repository
2. Ensure NODE_ENV=production is set in Render
3. Redeploy your application
4. The SSL error should be resolved

## Testing
Visit `https://your-app.onrender.com/health` to verify the deployment is working.