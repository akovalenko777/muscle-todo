import { Client } from 'pg';
// import { config } from 'dotenv';
// import { resolve } from 'node:path';

// config({ path: resolve(import.meta.dirname, '.env.test') });

export default async function globalSetup() {
  const client = new Client({
    connectionString: process.env.TEST_DATABASE_URL,
  });

  await client.connect();
  await client.query('TRUNCATE TABLE "user", "task" RESTART IDENTITY CASCADE');
  console.log('DB truncated')
  await client.end();
}