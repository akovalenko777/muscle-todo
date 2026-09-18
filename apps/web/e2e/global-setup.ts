import { Client } from 'pg';

export default async function globalSetup() {
  console.log('>>> globalSetup: truncating test DB')
  const client = new Client({
    connectionString: 'postgresql://kanban:kanban_dev_pass@localhost:5432/kanban_test?schema=public',
  });

  await client.connect();
  await client.query('TRUNCATE TABLE "user", "task" RESTART IDENTITY CASCADE');
  await client.end();
}