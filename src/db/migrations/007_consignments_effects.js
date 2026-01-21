export async function up(knex) {
  const hasTable = await knex.schema.hasTable('consignments');
  if (!hasTable) return;
  const hasColumn = await knex.schema.hasColumn('consignments', 'effects_json');
  if (!hasColumn) {
    await knex.schema.alterTable('consignments', (t) => {
      t.text('effects_json');
    });
  }
}

export async function down(knex) {
  const hasTable = await knex.schema.hasTable('consignments');
  if (!hasTable) return;
  const hasColumn = await knex.schema.hasColumn('consignments', 'effects_json');
  if (hasColumn) {
    await knex.schema.alterTable('consignments', (t) => {
      t.dropColumn('effects_json');
    });
  }
}
