import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './db/schema.js',
  out: './db/migrations',
  dialect: 'sqlite',
  driver: 'better-sqlite3',
  dbCredentials: {
    url: process.env.DATABASE_PATH || './database.sqlite',
  },
});
