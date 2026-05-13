import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not set. Database operations will fail.');
}

const client = postgres(connectionString || 'postgres://localhost:5432/postgres', { 
  prepare: false,
  max: connectionString ? undefined : 0 // Disable connection if no URL
});
export const db = drizzle(client, { schema });
