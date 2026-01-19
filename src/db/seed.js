import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import config from '../config.js';
import knex from './index.js';

async function seed() {
  if (config.db.client === 'sqlite') {
    await mkdir(path.dirname(config.db.filename), { recursive: true });
  }
  console.log('Seed completed.');
  await knex.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
