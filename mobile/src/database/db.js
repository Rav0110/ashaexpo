// Import directly from submodule to avoid hooks.js → expo-asset → URL polyfill crash
import { openDatabaseAsync } from 'expo-sqlite/build/SQLiteDatabase';
import { DB_NAME } from '../constants/appConfig';
import { createTables } from './schema';

let db = null;

/**
 * Open (or reuse) the SQLite database and ensure tables exist.
 */
export async function getDatabase() {
  if (db) return db;
  db = await openDatabaseAsync(DB_NAME);
  await createTables(db);
  return db;
}
