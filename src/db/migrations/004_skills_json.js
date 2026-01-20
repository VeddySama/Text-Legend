export async function up(knex) {
  const hasColumn = await knex.schema.hasColumn('characters', 'skills_json');
  if (!hasColumn) {
    await knex.schema.table('characters', (t) => {
      t.text('skills_json').notNullable().defaultTo('[]');
    });
  }
}

export async function down(knex) {
  const hasColumn = await knex.schema.hasColumn('characters', 'skills_json');
  if (hasColumn) {
    await knex.schema.table('characters', (t) => {
      t.dropColumn('skills_json');
    });
  }
}
