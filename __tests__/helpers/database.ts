import { Pool } from 'pg';

let testDB: Pool;

export async function setupTestDB(): Promise<void> {
  testDB = new Pool({
    connectionString: process.env.DATABASE_URL_TEST,
  });
  
  await testDB.query('BEGIN');
}

export async function teardownTestDB(): Promise<void> {
  if (testDB) {
    await testDB.query('ROLLBACK');
    await testDB.end();
  }
}

export async function clearTestData(): Promise<void> {
  await testDB.query('TRUNCATE TABLE family_members CASCADE');
  await testDB.query('TRUNCATE TABLE restaurants CASCADE');
  await testDB.query('TRUNCATE TABLE dining_sessions CASCADE');
}

export function getTestDB(): Pool {
  return testDB;
}