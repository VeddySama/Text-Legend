export const SKILLS = {
  warrior: {
    slash: { id: 'slash', name: '基本剑术', mp: 0, power: 1.0, type: 'attack' },
    assassinate: { id: 'assassinate', name: '刺杀剑术', mp: 8, power: 1.4, type: 'attack' },
    halfmoon: { id: 'halfmoon', name: '半月弯刀', mp: 12, power: 1.1, type: 'cleave' },
    firestrike: { id: 'firestrike', name: '烈火剑法', mp: 18, power: 1.8, type: 'attack' }
  },
  mage: {
    fireball: { id: 'fireball', name: '小火球', mp: 10, power: 1.3, type: 'spell' },
    lightning: { id: 'lightning', name: '雷电术', mp: 16, power: 1.7, type: 'spell' },
    iceblast: { id: 'iceblast', name: '冰咆哮', mp: 22, power: 2.0, type: 'spell' }
  },
  taoist: {
    heal: { id: 'heal', name: '治愈术', mp: 12, power: 1.0, type: 'heal' },
    poison: { id: 'poison', name: '施毒术', mp: 10, power: 0.6, type: 'dot' },
    soul: { id: 'soul', name: '灵魂火符', mp: 14, power: 1.4, type: 'spell' }
  }
};
