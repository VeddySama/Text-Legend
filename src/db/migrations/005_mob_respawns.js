export async function up(knex) {
  const hasTable = await knex.schema.hasTable('mob_respawns');
  if (hasTable) return;
  await knex.schema.createTable('mob_respawns', (t) => {
    t.string('zone_id').notNullable();
    t.string('room_id').notNullable();
    t.integer('slot_index').notNullable();
    t.string('template_id').notNullable();
    t.bigInteger('respawn_at').notNullable();
    t.primary(['zone_id', 'room_id', 'slot_index']);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('mob_respawns');
}
