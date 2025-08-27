# Required Environment Variables for Render Deployment

## Database Configuration
- **DATABASE_URL**: Automatically set by Render when you create a PostgreSQL database
  - Format: `postgresql://username:password@host:port/database?ssl=true`

## Session Configuration
- **SESSION_SECRET**: A secure random string for session encryption
  - Example: `your-super-secret-session-key-change-this-in-production`
  - Generate one: `openssl rand -base64 32`

## Node Environment
- **NODE_ENV**: Set to `production`
  - This enables SSL for database connections and secure cookies

## How to Set in Render

1. Go to your Render dashboard
2. Select your web service
3. Click on "Environment" tab
4. Add the following variables:
   - `NODE_ENV` = `production`
   - `SESSION_SECRET` = `<your-secure-secret-key>`
   - `DATABASE_URL` = (automatically set by Render)

## Testing the Deployment

After setting these variables and deploying:

1. Check health endpoint: `https://your-app.onrender.com/health`
2. This should return:
   ```json
   {
     "status": "ok",
     "timestamp": "2025-08-27T...",
     "environment": "production",
     "database": true
   }
   ```

## Troubleshooting

If you get a 502 error:
1. Check the Render logs for specific error messages
2. Ensure all environment variables are set
3. Verify the database is running and accessible
4. Check that the build command succeeded: `chmod +x render-build.sh && ./render-build.sh`
5. Verify the start command is correct: `node dist/index.js`