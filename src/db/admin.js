import knex from './index.js';

export async function createAdminSession(userId) {
  const token = `adm_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
  await knex('sessions').insert({ user_id: userId, token });
  return token;
}

export async function verifyAdminSession(token) {
  if (!token || !token.startsWith('adm_')) return null;
  const session = await knex('sessions').where({ token }).first();
  if (!session) return null;
  const user = await knex('users').where({ id: session.user_id }).first();
  if (!user || !user.is_admin) return null;
  return { session, user };
}

export async function listUsers() {
  return knex('users').select('id', 'username', 'is_admin', 'created_at');
}
