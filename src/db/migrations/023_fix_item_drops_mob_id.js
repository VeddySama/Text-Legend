export async function up(knex) {
  // 检查 item_drops 表是否存在
  const hasTable = await knex.schema.hasTable('item_drops');
  if (!hasTable) {
    console.log('item_drops table does not exist, skipping migration');
    return;
  }

  // 检查 mob_id 列是否存在
  const hasColumn = await knex.schema.hasColumn('item_drops', 'mob_id');
  if (!hasColumn) {
    console.log('mob_id column does not exist in item_drops table, skipping migration');
    return;
  }

  // 获取当前列信息
  const columnInfo = await knex('item_drops').columnInfo();
  const currentMobIdType = columnInfo.mob_id.type;

  console.log('Current mob_id type:', currentMobIdType);

  // 如果 mob_id 是 integer 类型，需要改为 varchar
  if (currentMobIdType.includes('int')) {
    console.log('Changing mob_id from integer to varchar...');

    // 1. 删除外键约束（如果有）
    await knex.raw('PRAGMA foreign_keys = OFF');

    // 2. 临时重命名表
    await knex.schema.renameTable('item_drops', 'item_drops_old');

    // 3. 创建新表，mob_id 改为 varchar
    await knex.schema.createTable('item_drops', (t) => {
      t.increments('id').primary();
      t.integer('item_id').notNullable();
      t.string('mob_id', 64).notNullable();
      t.decimal('drop_chance', 5, 4).notNullable().defaultTo(0.0);
      t.timestamp('created_at').defaultTo(knex.fn.now());
      t.timestamp('updated_at').defaultTo(knex.fn.now());
      t.unique(['item_id', 'mob_id']);
    });

    // 4. 迁移数据（将 mob_id 从 integer 转为 varchar）
    await knex('item_drops').insert(
      knex('item_drops_old').select('*')
    );

    // 5. 删除旧表
    await knex.schema.dropTable('item_drops_old');

    // 6. 重建索引
    await knex.schema.alterTable('item_drops', (t) => {
      t.index('mob_id');
      t.index('drop_chance');
    });

    // 7. 添加外键约束
    await knex.schema.alterTable('item_drops', (t) => {
      t.foreign('item_id').references('items.id').onDelete('CASCADE');
    });

    await knex.raw('PRAGMA foreign_keys = ON');

    console.log('Migration completed successfully');
  } else {
    console.log('mob_id is already varchar type, no migration needed');
  }
}

export async function down(knex) {
  // 回滚：将 mob_id 改回 integer 类型
  await knex.raw('PRAGMA foreign_keys = OFF');

  await knex.schema.renameTable('item_drops', 'item_drops_old');

  await knex.schema.createTable('item_drops', (t) => {
    t.increments('id').primary();
    t.integer('item_id').notNullable();
    t.integer('mob_id').notNullable();
    t.decimal('drop_chance', 5, 4).notNullable().defaultTo(0.0);
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.timestamp('updated_at').defaultTo(knex.fn.now());
    t.unique(['item_id', 'mob_id']);
  });

  // 只迁移可以转换为 integer 的数据
  await knex('item_drops').insert(
    knex.raw(`
      SELECT id, item_id,
             CAST(mob_id AS INTEGER) as mob_id,
             drop_chance, created_at, updated_at
      FROM item_drops_old
      WHERE mob_id GLOB '[0-9]*'
    `)
  );

  await knex.schema.dropTable('item_drops_old');

  await knex.schema.alterTable('item_drops', (t) => {
    t.index('mob_id');
    t.index('drop_chance');
  });

  await knex.schema.alterTable('item_drops', (t) => {
    t.foreign('item_id').references('items.id').onDelete('CASCADE');
  });

  await knex.raw('PRAGMA foreign_keys = ON');
}
