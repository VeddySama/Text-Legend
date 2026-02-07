export async function up(knex) {
  const hasColumn = await knex.schema.hasColumn('items', 'cross_world_boss_only');
  if (!hasColumn) {
    await knex.schema.alterTable('items', (t) => {
      t.boolean('cross_world_boss_only').defaultTo(false);
    });
  }
}

export async function down(knex) {
  const hasColumn = await knex.schema.hasColumn('items', 'cross_world_boss_only');
  if (hasColumn) {
    await knex.schema.alterTable('items', (t) => {
      t.dropColumn('cross_world_boss_only');
    });
  }
}
