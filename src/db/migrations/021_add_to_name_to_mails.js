export async function up(knex) {
  await knex.schema.table('mails', (t) => {
    t.string('to_name', 64).nullable();
  });
}

export async function down(knex) {
  await knex.schema.table('mails', (t) => {
    t.dropColumn('to_name');
  });
}
