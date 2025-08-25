import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function runMigrations() {
  try {
    console.log('Running database migrations...');
    await execAsync('npx drizzle-kit push');
    console.log('Database migrations completed successfully');
  } catch (error) {
    console.log('Database migrations skipped or failed:', error);
    // Don't fail the startup process if migrations fail
    // This allows the app to start even if DB is already up to date
  }
}