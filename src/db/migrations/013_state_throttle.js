export async function up(knex) {
  const exists = await knex('game_settings').where({ key: 'state_throttle_enabled' }).first();
  if (!exists) {
    await knex('game_settings').insert([
      { key: 'state_throttle_enabled', value: 'false' }
    ]);
  }
}

export async function down(knex) {
  await knex('game_settings').where({ key: 'state_throttle_enabled' }).del();
}
