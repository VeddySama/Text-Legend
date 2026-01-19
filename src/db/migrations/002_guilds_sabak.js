export async function up(knex) {
  await knex.schema.createTable('guilds', (t) => {
    t.increments('id').primary();
    t.string('name', 64).notNullable().unique();
    t.integer('leader_user_id').notNullable();
    t.string('leader_char_name', 64).notNullable();
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('guild_members', (t) => {
    t.increments('id').primary();
    t.integer('guild_id').notNullable().references('guilds.id').onDelete('CASCADE');
    t.integer('user_id').notNullable();
    t.string('char_name', 64).notNullable();
    t.string('role', 32).notNullable();
    t.unique(['guild_id', 'char_name']);
  });

  await knex.schema.createTable('sabak_state', (t) => {
    t.integer('id').primary();
    t.integer('owner_guild_id').nullable();
    t.string('owner_guild_name', 64).nullable();
    t.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('sabak_registrations', (t) => {
    t.increments('id').primary();
    t.integer('guild_id').notNullable().references('guilds.id').onDelete('CASCADE');
    t.timestamp('registered_at').defaultTo(knex.fn.now());
    t.unique(['guild_id']);
  });

  await knex('sabak_state').insert({ id: 1, owner_guild_id: null, owner_guild_name: null });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('sabak_registrations');
  await knex.schema.dropTableIfExists('sabak_state');
  await knex.schema.dropTableIfExists('guild_members');
  await knex.schema.dropTableIfExists('guilds');
}
