export async function up(knex) {
  await knex.schema.createTable('users', (t) => {
    t.increments('id').primary();
    t.string('username', 64).notNullable().unique();
    t.string('password_hash', 255).notNullable();
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('sessions', (t) => {
    t.increments('id').primary();
    t.integer('user_id').notNullable().references('users.id').onDelete('CASCADE');
    t.string('token', 64).notNullable().unique();
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('last_seen').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('characters', (t) => {
    t.increments('id').primary();
    t.integer('user_id').notNullable().references('users.id').onDelete('CASCADE');
    t.string('name', 64).notNullable();
    t.string('class', 32).notNullable();
    t.integer('level').notNullable();
    t.integer('exp').notNullable();
    t.integer('gold').notNullable();
    t.integer('hp').notNullable();
    t.integer('mp').notNullable();
    t.integer('max_hp').notNullable();
    t.integer('max_mp').notNullable();
    t.text('stats_json').notNullable();
    t.text('position_json').notNullable();
    t.text('inventory_json').notNullable();
    t.text('equipment_json').notNullable();
    t.text('quests_json').notNullable();
    t.text('flags_json').notNullable();
    t.timestamp('updated_at').defaultTo(knex.fn.now());
    t.unique(['user_id', 'name']);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('characters');
  await knex.schema.dropTableIfExists('sessions');
  await knex.schema.dropTableIfExists('users');
}
