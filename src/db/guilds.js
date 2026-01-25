import knex from './index.js';

export async function getGuildByName(name) {
  return knex('guilds').where({ name }).first();
}

export async function getGuildById(id) {
  return knex('guilds').where({ id }).first();
}

export async function createGuild(name, leaderUserId, leaderCharName) {
  const [id] = await knex('guilds').insert({ name, leader_user_id: leaderUserId, leader_char_name: leaderCharName });
  await knex('guild_members').insert({ guild_id: id, user_id: leaderUserId, char_name: leaderCharName, role: 'leader' });
  return id;
}

export async function addGuildMember(guildId, userId, charName) {
  await knex('guild_members').insert({ guild_id: guildId, user_id: userId, char_name: charName, role: 'member' });
}

export async function removeGuildMember(guildId, userId, charName) {
  await knex('guild_members').where({ guild_id: guildId, user_id: userId, char_name: charName }).del();
}

export async function leaveGuild(userId, charName) {
  const row = await knex('guild_members').where({ user_id: userId, char_name: charName }).first();
  if (!row) return null;
  await knex('guild_members').where({ user_id: userId, char_name: charName }).del();
  return row.guild_id;
}

export async function getGuildMember(userId, charName) {
  const row = await knex('guild_members').where({ user_id: userId, char_name: charName }).first();
  if (!row) return null;
  const guild = await getGuildById(row.guild_id);
  return { guild, role: row.role };
}

export async function listGuildMembers(guildId) {
  return knex('guild_members').where({ guild_id: guildId }).select('char_name', 'role', 'user_id');
}

export async function isGuildLeader(guildId, userId, charName) {
  const row = await knex('guild_members').where({ guild_id: guildId, user_id: userId, char_name: charName }).first();
  console.log('[isGuildLeader] guildId:', guildId, 'userId:', userId, 'charName:', charName, 'row:', row);
  return row && row.role === 'leader';
}

export async function transferGuildLeader(guildId, oldLeaderUserId, oldLeaderCharName, newLeaderUserId, newLeaderCharName) {
  await knex.transaction(async (trx) => {
    const oldLeaderRows = await trx('guild_members')
      .where({ guild_id: guildId, user_id: oldLeaderUserId, char_name: oldLeaderCharName })
      .update({ role: 'member' });
    if (oldLeaderRows === 0) {
      throw new Error('旧会长记录不存在或已更新');
    }
    const newLeaderRows = await trx('guild_members')
      .where({ guild_id: guildId, user_id: newLeaderUserId, char_name: newLeaderCharName })
      .update({ role: 'leader' });
    if (newLeaderRows === 0) {
      throw new Error('新会长记录不存在');
    }
    await trx('guilds')
      .where({ id: guildId })
      .update({ leader_user_id: newLeaderUserId, leader_char_name: newLeaderCharName });
  });
}

export async function getSabakOwner() {
  return knex('sabak_state').where({ id: 1 }).first();
}

export async function setSabakOwner(guildId, guildName) {
  await knex('sabak_state').where({ id: 1 }).update({ owner_guild_id: guildId, owner_guild_name: guildName, updated_at: knex.fn.now() });
}

export async function registerSabak(guildId) {
  await knex('sabak_registrations')
    .insert({ guild_id: guildId, registered_at: knex.fn.now() })
    .onConflict(['guild_id'])
    .merge({ registered_at: knex.fn.now() });
}

export async function listSabakRegistrations() {
  return knex('sabak_registrations')
    .join('guilds', 'sabak_registrations.guild_id', 'guilds.id')
    .select('guilds.name as guild_name', 'sabak_registrations.guild_id', 'sabak_registrations.registered_at');
}

export async function hasSabakRegistrationToday(guildId) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  const row = await knex('sabak_registrations')
    .where({ guild_id: guildId })
    .where('registered_at', '>=', start)
    .where('registered_at', '<', end)
    .first();
  return !!row;
}

export async function clearSabakRegistrations() {
  await knex('sabak_registrations').del();
}
