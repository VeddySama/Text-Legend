export async function up(knex) {
  // 创建装备管理表
  await knex.schema.createTable('items', (t) => {
    t.increments('id').primary();
    t.string('item_id', 64).notNullable().unique();
    t.string('name', 128).notNullable();
    t.string('type', 32).notNullable(); // weapon, armor, helmet, boots, belt, necklace, ring, bracelet, consumable, book, material
    t.string('slot', 32).nullable(); // weapon, chest, head, feet, waist, neck, ring_left, ring_right, bracelet_left, bracelet_right
    t.string('rarity', 32).defaultTo('common'); // common, uncommon, rare, epic, legendary, supreme
    t.integer('atk').defaultTo(0);
    t.integer('def').defaultTo(0);
    t.integer('mag').defaultTo(0);
    t.integer('spirit').defaultTo(0); // 道术
    t.integer('hp').defaultTo(0);
    t.integer('mp').defaultTo(0);
    t.integer('mdef').defaultTo(0); // 魔御
    t.integer('dex').defaultTo(0); // 敏捷
    t.integer('price').defaultTo(0);
    t.boolean('untradable').defaultTo(false);
    t.boolean('unconsignable').defaultTo(false);
    t.boolean('boss_only').defaultTo(false);
    t.boolean('world_boss_only').defaultTo(false);
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // 创建装备掉落配置表
  await knex.schema.createTable('item_drops', (t) => {
    t.increments('id').primary();
    t.integer('item_id').notNullable().references('items.id').onDelete('CASCADE');
    t.string('mob_id', 64).notNullable(); // 怪物ID (MOB_TEMPLATES中的key)
    t.decimal('drop_chance', 5, 4).notNullable().defaultTo(0.0); // 掉落概率 0.0000-1.0000
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('updated_at').defaultTo(knex.fn.now());
    t.unique(['item_id', 'mob_id']);
  });

  // 创建索引
  await knex.schema.alterTable('items', (t) => {
    t.index('type');
    t.index('rarity');
    t.index('slot');
  });

  await knex.schema.alterTable('item_drops', (t) => {
    t.index('mob_id');
    t.index('drop_chance');
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('item_drops');
  await knex.schema.dropTableIfExists('items');
}
