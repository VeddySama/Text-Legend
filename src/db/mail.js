import knex from './index.js';

export async function sendMail(toUserId, fromName, title, body) {
  const [id] = await knex('mails').insert({ to_user_id: toUserId, from_name: fromName, title, body });
  return id;
}

export async function listMail(userId) {
  return knex('mails').where({ to_user_id: userId }).orderBy('created_at', 'desc');
}

export async function markMailRead(userId, mailId) {
  await knex('mails').where({ id: mailId, to_user_id: userId }).update({ read_at: knex.fn.now() });
}
