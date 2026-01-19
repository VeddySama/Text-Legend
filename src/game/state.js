import { WORLD } from './world.js';
import { MOB_TEMPLATES } from './mobs.js';
import { randInt } from './utils.js';

const ROOM_MOBS = new Map();

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

export function spawnMobs(zoneId, roomId) {
  const room = getRoom(zoneId, roomId);
  if (!room || !room.spawns || room.spawns.length === 0) return [];
  const mobList = getRoomMobs(zoneId, roomId);
  if (mobList.length >= room.spawns.length) return mobList;

  while (mobList.length < room.spawns.length) {
    const templateId = room.spawns[mobList.length];
    const tpl = MOB_TEMPLATES[templateId];
    mobList.push({
      id: `${templateId}-${Date.now()}-${randInt(100, 999)}`,
      templateId,
      name: tpl.name,
      level: tpl.level,
      hp: tpl.hp,
      max_hp: tpl.hp,
      atk: tpl.atk,
      def: tpl.def,
      dex: tpl.dex || 6,
      status: {},
      respawnAt: null
    });
  }
  return mobList;
}

export function removeMob(zoneId, roomId, mobId) {
  const mobs = getRoomMobs(zoneId, roomId);
  const idx = mobs.findIndex((m) => m.id === mobId);
  if (idx >= 0) {
    mobs.splice(idx, 1);
  }
}

export function resetRoom(zoneId, roomId) {
  ROOM_MOBS.delete(roomKey(zoneId, roomId));
}
