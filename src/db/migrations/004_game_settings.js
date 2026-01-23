export async function up(knex) {
  await knex.schema.createTable('game_settings', (t) => {
    t.string('key', 64).primary();
    t.text('value').notNullable();
    t.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // 初始化VIP自助获取开关设置
  await knex('game_settings').insert([
    { key: 'vip_self_claim_enabled', value: 'true' }
  ]);
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('game_settings');
}
