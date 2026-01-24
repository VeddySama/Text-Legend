export async function up(knex) {
  const hasCurrentHp = await knex.schema.hasColumn('mob_respawns', 'current_hp');
  if (!hasCurrentHp) {
    await knex.schema.alterTable('mob_respawns', (t) => {
      t.integer('current_hp').nullable();
      t.text('status').nullable();
    });
  }
}

export async function down(knex) {
  await knex.schema.alterTable('mob_respawns', (t) => {
    t.dropColumn('current_hp');
    t.dropColumn('status');
  });
}
