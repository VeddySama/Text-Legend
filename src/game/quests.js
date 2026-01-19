export const QUESTS = {
  wolf_pelts: {
    id: 'wolf_pelts',
    name: '猎狼任务',
    desc: '为猎户击杀 5 只狼。',
    goals: { kill: { wolf: 5 } },
    rewards: { exp: 120, gold: 60, items: ['ring_copper'] }
  },
  zombie_cleansing: {
    id: 'zombie_cleansing',
    name: '清理僵尸',
    desc: '在古墓附近击败 6 只僵尸。',
    goals: { kill: { zombie: 6 } },
    rewards: { exp: 220, gold: 120, items: ['armor_cloth'] }
  }
};
