export async function up(knex) {
  // 为 characters 表添加排行榜称号字段
  await knex.schema.table('characters', (t) => {
    t.string('rank_title', 32).defaultTo('').comment('排行榜称号');
  });
}

export async function down(knex) {
  await knex.schema.table('characters', (t) => {
    t.dropColumn('rank_title');
  });
}
