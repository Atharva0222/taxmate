import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure Neon based on environment
if (process.env.NODE_ENV === 'production') {
  // In production, use HTTP instead of WebSockets
  neonConfig.fetchConnectionCache = true;
  neonConfig.poolQueryViaFetch = true;
} else {
  // In development, use WebSockets
  neonConfig.webSocketConstructor = ws;
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create pool with proper SSL configuration for production
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 30000, // 30 seconds timeout
  idleTimeoutMillis: 30000,
  max: 10, // max pool size
  ...(process.env.NODE_ENV === 'production' && {
    ssl: {
      rejectUnauthorized: false
    }
  })
});

export const db = drizzle({ client: pool, schema });
