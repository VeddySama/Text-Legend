import knex from './index.js';

export async function listMobRespawns() {
  return knex('mob_respawns').select('zone_id', 'room_id', 'slot_index', 'template_id', 'respawn_at');
}

export async function upsertMobRespawn(zoneId, roomId, slotIndex, templateId, respawnAt) {
  return knex('mob_respawns')
    .insert({
      zone_id: zoneId,
      room_id: roomId,
      slot_index: slotIndex,
      template_id: templateId,
      respawn_at: respawnAt
    })
    .onConflict(['zone_id', 'room_id', 'slot_index'])
    .merge({
      template_id: templateId,
      respawn_at: respawnAt
    });
}

export async function clearMobRespawn(zoneId, roomId, slotIndex) {
  return knex('mob_respawns')
    .where({ zone_id: zoneId, room_id: roomId, slot_index: slotIndex })
    .del();
}
