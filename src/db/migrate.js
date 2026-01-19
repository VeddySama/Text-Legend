import knex from './index.js';
import { readdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

async function migrate() {
  const dir = new URL('./migrations/', import.meta.url);
  const files = (await readdir(dir)).filter((f) => f.endsWith('.js')).sort();

  const hasTable = await knex.schema.hasTable('knex_migrations_custom');
  if (!hasTable) {
    await knex.schema.createTable('knex_migrations_custom', (t) => {
      t.string('name').primary();
      t.timestamp('run_at').defaultTo(knex.fn.now());
    });
  }

  const ranRows = await knex('knex_migrations_custom').select('name');
  const ran = new Set(ranRows.map((r) => r.name));

  for (const file of files) {
    if (ran.has(file)) continue;
    const mod = await import(pathToFileURL(join(dir.pathname, file)).href);
    if (mod.up) {
      await mod.up(knex);
      await knex('knex_migrations_custom').insert({ name: file });
      console.log(`migrated ${file}`);
    }
  }

  await knex.destroy();
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
