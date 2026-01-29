export async function up(knex) {
  await knex.schema.table('mails', (t) => {
    t.integer('from_user_id').nullable().references('users.id');
    t.index('from_user_id');
  });
}

export async function down(knex) {
  await knex.schema.table('mails', (t) => {
    t.dropColumn('from_user_id');
  });
}
