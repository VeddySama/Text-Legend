import { WORLD } from './world.js';
import { MOB_TEMPLATES } from './mobs.js';
import { randInt } from './utils.js';

const ROOM_MOBS = new Map();
const RESPAWN_CACHE = new Map();
let respawnStore = null;

function respawnKey(zoneId, roomId, slotIndex) {
  return `${zoneId}:${roomId}:${slotIndex}`;
}

function roomKey(zoneId, roomId) {
  return `${zoneId}:${roomId}`;
}

export function getRoom(zoneId, roomId) {
  const zone = WORLD[zoneId];
  if (!zone) return null;
  return zone.rooms[roomId] || null;
}

export function getRoomMobs(zoneId, roomId) {
  const key = roomKey(zoneId, roomId);
  if (!ROOM_MOBS.has(key)) {
    ROOM_MOBS.set(key, []);
  }
  return ROOM_MOBS.get(key);
}

export function seedRespawnCache(records) {
  RESPAWN_CACHE.clear();
  if (!Array.isArray(records)) return;
  records.forEach((row) => {
    if (!row) return;
    const zoneId = row.zone_id || row.zoneId;
    const roomId = row.room_id || row.roomId;
    const slotIndex = Number(row.slot_index ?? row.slotIndex);
    if (!zoneId || !roomId || Number.isNaN(slotIndex)) return;
    RESPAWN_CACHE.set(respawnKey(zoneId, roomId, slotIndex), {
      templateId: row.template_id || row.templateId,
      respawnAt: Number(row.respawn_at ?? row.respawnAt)
    });
  });
}

export function setRespawnStore(store) {
  respawnStore = store;
}

export function getAliveMobs(zoneId, roomId) {
  return getRoomMobs(zoneId, roomId).filter((m) => m.hp > 0);
}

export function spawnMobs(zoneId, roomId) {
  const room = getRoom(zoneId, roomId);
  if (!room || !room.spawns || room.spawns.length === 0) return [];
  const mobList = getRoomMobs(zoneId, roomId);
  const now = Date.now();
  room.spawns.forEach((templateId, index) => {
    let mob = mobList.find((m) => m.slotIndex === index);
    const tpl = MOB_TEMPLATES[templateId];
    if (!mob) {
      const cached = RESPAWN_CACHE.get(respawnKey(zoneId, roomId, index));
      if (cached && cached.respawnAt && cached.respawnAt > now && (!cached.templateId || cached.templateId === templateId)) {
        mob = {
          id: `${templateId}-${Date.now()}-${randInt(100, 999)}`,
          templateId,
          slotIndex: index,
          name: tpl.name,
          level: tpl.level,
          hp: 0,
          max_hp: tpl.hp,
          atk: tpl.atk,
          def: tpl.def,
          dex: tpl.dex || 6,
          status: {},
          respawnAt: cached.respawnAt,
          justRespawned: false
        };
        mobList.push(mob);
        return;
      }
      mob = {
        id: `${templateId}-${Date.now()}-${randInt(100, 999)}`,
        templateId,
        slotIndex: index,
        name: tpl.name,
        level: tpl.level,
        hp: tpl.hp,
        max_hp: tpl.hp,
        atk: tpl.atk,
        def: tpl.def,
        dex: tpl.dex || 6,
        status: {},
        respawnAt: null,
        justRespawned: false
      };
      mobList.push(mob);
      return;
    }
    if (mob.hp <= 0 && mob.respawnAt && now >= mob.respawnAt) {
      mob.id = `${templateId}-${Date.now()}-${randInt(100, 999)}`;
      mob.templateId = templateId;
      mob.name = tpl.name;
      mob.level = tpl.level;
      mob.hp = tpl.hp;
      mob.max_hp = tpl.hp;
      mob.atk = tpl.atk;
      mob.def = tpl.def;
      mob.dex = tpl.dex || 6;
      mob.status = {};
      mob.respawnAt = null;
      mob.justRespawned = Boolean(tpl.worldBoss);
      RESPAWN_CACHE.delete(respawnKey(zoneId, roomId, index));
      if (respawnStore && respawnStore.clear) {
        respawnStore.clear(zoneId, roomId, index);
      }
    }
  });
  return mobList;
}

export function removeMob(zoneId, roomId, mobId) {
  const mobs = getRoomMobs(zoneId, roomId);
  const idx = mobs.findIndex((m) => m.id === mobId);
  if (idx >= 0) {
    const mob = mobs[idx];
    mob.hp = 0;
    mob.status = {};
    const tpl = MOB_TEMPLATES[mob.templateId];
    const isBoss = tpl && (
      tpl.worldBoss ||
      tpl.id.includes('boss') ||
      tpl.id.includes('leader') ||
      tpl.id.includes('demon') ||
      ['bug_queen', 'huangquan', 'evil_snake', 'pig_white'].includes(tpl.id)
    );
    const delayMs = tpl && tpl.worldBoss ? 60 * 60 * 1000 : (isBoss ? 60 * 1000 : 0);
    mob.respawnAt = Date.now() + delayMs;
    if (delayMs > 0) {
      RESPAWN_CACHE.set(respawnKey(zoneId, roomId, mob.slotIndex), {
        templateId: mob.templateId,
        respawnAt: mob.respawnAt
      });
      if (respawnStore && respawnStore.set) {
        respawnStore.set(zoneId, roomId, mob.slotIndex, mob.templateId, mob.respawnAt);
      }
    } else {
      RESPAWN_CACHE.delete(respawnKey(zoneId, roomId, mob.slotIndex));
      if (respawnStore && respawnStore.clear) {
        respawnStore.clear(zoneId, roomId, mob.slotIndex);
      }
    }
    return mob;
  }
  return null;
}

export function resetRoom(zoneId, roomId) {
  ROOM_MOBS.delete(roomKey(zoneId, roomId));
}
