export async function up(knex) {
  const exists = await knex('game_settings').where({ key: 'state_throttle_enabled' }).first();
  if (!exists) {
    await knex('game_settings').insert([
      { key: 'state_throttle_enabled', value: 'false' }
    ]);
  }
  const intervalExists = await knex('game_settings').where({ key: 'state_throttle_interval_sec' }).first();
  if (!intervalExists) {
    await knex('game_settings').insert([
      { key: 'state_throttle_interval_sec', value: '10' }
    ]);
  }
  const overrideExists = await knex('game_settings').where({ key: 'state_throttle_override_server_allowed' }).first();
  if (!overrideExists) {
    await knex('game_settings').insert([
      { key: 'state_throttle_override_server_allowed', value: 'true' }
    ]);
  }
}

export async function down(knex) {
  await knex('game_settings').where({ key: 'state_throttle_enabled' }).del();
  await knex('game_settings').where({ key: 'state_throttle_interval_sec' }).del();
  await knex('game_settings').where({ key: 'state_throttle_override_server_allowed' }).del();
}
