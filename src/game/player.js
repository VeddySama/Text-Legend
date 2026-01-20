import { CLASSES, START_POSITION, expForLevel, maxBagSlots } from './constants.js';
import { ITEM_TEMPLATES } from './items.js';
import { DEFAULT_SKILLS } from './skills.js';
import { clamp } from './utils.js';

export function newCharacter(name, classId) {
  const cls = CLASSES[classId];
  const level = 1;
  const stats = { ...cls.base, vit: cls.base.con };
  const maxHp = cls.base.con * 10 + cls.hpPerLevel;
  const maxMp = cls.base.spirit * 8 + cls.mpPerLevel;

  return {
    name,
    classId,
    level,
    exp: 0,
    gold: 100,
    hp: maxHp,
    mp: maxMp,
    max_hp: maxHp,
    max_mp: maxMp,
    stats,
    position: { ...START_POSITION },
    inventory: [
      { id: 'potion_small', qty: 3 },
      { id: 'potion_mana', qty: 2 }
    ],
    equipment: {
      weapon: null,
      chest: null,
      feet: null,
      ring_left: null,
      ring_right: null,
      neck: null,
      head: null,
      waist: null,
      bracelet_left: null,
      bracelet_right: null
    },
    quests: {},
    skills: [DEFAULT_SKILLS[classId]].filter(Boolean),
    flags: {
      tutorial: true,
      pkValue: 0,
      vip: false,
      offlineAt: null,
      autoSkillId: null,
      autoHpPct: null,
      autoMpPct: null,
      training: { hp: 0, mp: 0, atk: 0, mag: 0, spirit: 0 }
    },
    status: {}
  };
}

export function computeDerived(player) {
  if (!player.flags) player.flags = {};
  if (!player.flags.training) {
    player.flags.training = { hp: 0, mp: 0, atk: 0, def: 0, mag: 0, mdef: 0, spirit: 0 };
  }
  const cls = CLASSES[player.classId];
  const base = cls.base;
  const level = player.level;
  const bonus = Object.values(player.equipment)
    .filter(Boolean)
    .map((item) => ITEM_TEMPLATES[item.id]);

  const stats = { ...base };
  for (const item of bonus) {
    stats.str += item.atk ? Math.floor(item.atk / 2) : 0;
    stats.dex += item.dex || 0;
    stats.int += item.mag ? Math.floor(item.mag / 2) : 0;
    stats.con += item.def ? Math.floor(item.def / 2) : 0;
    stats.spirit += item.spirit || 0;
  }
  const training = player.flags.training;
  stats.spirit += training.spirit || 0;

  player.stats = stats;
  player.max_hp = base.con * 10 + cls.hpPerLevel * level + stats.con * 2 + (training.hp || 0);
  player.max_mp = base.spirit * 8 + cls.mpPerLevel * level + stats.spirit * 2 + (training.mp || 0);
  player.hp = clamp(player.hp, 1, player.max_hp);
  player.mp = clamp(player.mp, 0, player.max_mp);

  player.atk = stats.str * 1.6 + level * 1.2 + (training.atk || 0);
  player.def = stats.con * 1.1 + level * 0.8 + (training.def || 0);
  player.dex = stats.dex;
  player.mag = stats.int * 1.4 + stats.spirit * 0.6 + (training.mag || 0);
  player.spirit = stats.spirit;
  player.mdef = stats.spirit * 1.1 + level * 0.8 + (training.mdef || 0);
}

export function gainExp(player, amount) {
  player.exp += amount;
  let leveled = false;
  while (player.exp >= expForLevel(player.level)) {
    player.exp -= expForLevel(player.level);
    player.level += 1;
    leveled = true;
  }
  if (leveled) {
    computeDerived(player);
    player.hp = player.max_hp;
    player.mp = player.max_mp;
  }
  return leveled;
}

export function bagLimit(player) {
  return maxBagSlots(player.level);
}

export function addItem(player, itemId, qty = 1) {
  if (!player.inventory) player.inventory = [];
  const slot = player.inventory.find((i) => i.id === itemId);
  if (slot) {
    slot.qty += qty;
  } else {
    player.inventory.push({ id: itemId, qty });
  }
}

export function normalizeInventory(player) {
  const merged = new Map();
  (player.inventory || []).forEach((slot) => {
    if (!slot || !slot.id) return;
    const id = slot.id;
    const qty = Number(slot.qty || 0);
    if (qty <= 0) return;
    const cur = merged.get(id) || { id, qty: 0 };
    cur.qty += qty;
    merged.set(id, cur);
  });
  player.inventory = Array.from(merged.values());
}
export function normalizeEquipment(player) {
  if (!player.equipment) player.equipment = {};
  if (player.equipment.ring && !player.equipment.ring_left && !player.equipment.ring_right) {
    player.equipment.ring_left = player.equipment.ring;
  }
  if (player.equipment.bracelet && !player.equipment.bracelet_left && !player.equipment.bracelet_right) {
    player.equipment.bracelet_left = player.equipment.bracelet;
  }
  delete player.equipment.ring;
  delete player.equipment.bracelet;
  player.equipment.ring_left = player.equipment.ring_left || null;
  player.equipment.ring_right = player.equipment.ring_right || null;
  player.equipment.bracelet_left = player.equipment.bracelet_left || null;
  player.equipment.bracelet_right = player.equipment.bracelet_right || null;
}

function resolveEquipSlot(player, item) {
  const slot = item.slot;
  if (slot === 'ring') {
    if (!player.equipment.ring_left) return 'ring_left';
    if (!player.equipment.ring_right) return 'ring_right';
    return 'ring_left';
  }
  if (slot === 'bracelet') {
    if (!player.equipment.bracelet_left) return 'bracelet_left';
    if (!player.equipment.bracelet_right) return 'bracelet_right';
    return 'bracelet_left';
  }
  return slot;
}

export function removeItem(player, itemId, qty = 1) {
  const slot = player.inventory.find((i) => i.id === itemId);
  if (!slot) return false;
  if (slot.qty < qty) return false;
  slot.qty -= qty;
  if (slot.qty <= 0) {
    player.inventory = player.inventory.filter((i) => i !== slot);
  }
  return true;
}

export function equipItem(player, itemId) {
  const item = ITEM_TEMPLATES[itemId];
  if (!item || !item.slot) return { ok: false, msg: '\u8BE5\u7269\u54C1\u65E0\u6CD5\u88C5\u5907\u3002' };
  const has = player.inventory.find((i) => i.id === itemId);
  if (!has) return { ok: false, msg: '\u80CC\u5305\u91CC\u6CA1\u6709\u8BE5\u7269\u54C1\u3002' };

  normalizeEquipment(player);
  const slot = resolveEquipSlot(player, item);
  if (player.equipment[slot]) {
    addItem(player, player.equipment[slot].id, 1);
  }

  player.equipment[slot] = { id: itemId };
  removeItem(player, itemId, 1);
  computeDerived(player);
  return { ok: true, msg: `\u5DF2\u88C5\u5907${item.name}\u3002` };
}

export function unequipItem(player, slot) {
  normalizeEquipment(player);
  if (slot === 'ring') {
    slot = player.equipment.ring_left ? 'ring_left' : 'ring_right';
  }
  if (slot === 'bracelet') {
    slot = player.equipment.bracelet_left ? 'bracelet_left' : 'bracelet_right';
  }
  const current = player.equipment[slot];
  if (!current) return { ok: false, msg: '\u8BE5\u90E8\u4F4D\u6CA1\u6709\u88C5\u5907\u3002' };
  addItem(player, current.id, 1);
  player.equipment[slot] = null;
  computeDerived(player);
  return { ok: true, msg: `\u5DF2\u5378\u4E0B${ITEM_TEMPLATES[current.id].name}\u3002` };
}
