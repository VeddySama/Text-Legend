export async function up(knex) {
  // Drop old composite index if exists
  if (await knex.schema.hasTable('mob_respawns')) {
    try {
      // SQLite doesn't support dropping indexes directly, so we recreate the table
      const columns = await knex('mob_respawns').columnInfo();
      const data = await knex('mob_respawns').select('*');
      
      await knex.schema.dropTableIfExists('mob_respawns');
      
      await knex.schema.createTable('mob_respawns', (t) => {
        t.integer('realm_id').notNullable();
        t.string('zone_id').notNullable();
        t.string('room_id').notNullable();
        t.integer('slot_index').notNullable();
        t.string('template_id').notNullable();
        t.bigInteger('respawn_at').notNullable();
        t.integer('current_hp').nullable();
        t.text('status').nullable();
        
        // Set the correct composite primary key including realm_id
        t.primary(['realm_id', 'zone_id', 'room_id', 'slot_index']);
      });
      
      // Restore data
      if (data && data.length > 0) {
        await knex('mob_respawns').insert(data);
      }
    } catch (err) {
      console.error('Failed to fix mob_respawns primary key:', err);
      throw err;
    }
  }
}

export async function down(knex) {
  // Revert back to the old schema without realm_id in primary key
  if (await knex.schema.hasTable('mob_respawns')) {
    try {
      const data = await knex('mob_respawns').select('*');
      
      await knex.schema.dropTableIfExists('mob_respawns');
      
      await knex.schema.createTable('mob_respawns', (t) => {
        t.string('zone_id').notNullable();
        t.string('room_id').notNullable();
        t.integer('slot_index').notNullable();
        t.string('template_id').notNullable();
        t.bigInteger('respawn_at').notNullable();
        t.integer('current_hp').nullable();
        t.text('status').nullable();
        t.integer('realm_id').notNullable().defaultTo(1);
        
        // Old primary key without realm_id
        t.primary(['zone_id', 'room_id', 'slot_index']);
      });
      
      // Restore data
      if (data && data.length > 0) {
        await knex('mob_respawns').insert(data);
      }
    } catch (err) {
      console.error('Failed to revert mob_respawns primary key:', err);
      throw err;
    }
  }
}
