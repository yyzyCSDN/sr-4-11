import { MonsterTemplate, TrapTemplate, TreasureTemplate, Hero } from '../types/game';

export const MONSTER_TEMPLATES: MonsterTemplate[] = [
  { id: 'slime', name: '史莱姆', emoji: '🟢', hp: 30, attack: 5, defense: 2, expReward: 10, goldReward: 5 },
  { id: 'goblin', name: '哥布林', emoji: '👺', hp: 50, attack: 10, defense: 5, expReward: 25, goldReward: 15 },
  { id: 'skeleton', name: '骷髅兵', emoji: '💀', hp: 60, attack: 12, defense: 8, expReward: 35, goldReward: 20 },
  { id: 'orc', name: '兽人', emoji: '👹', hp: 80, attack: 15, defense: 10, expReward: 50, goldReward: 30 },
  { id: 'demon', name: '恶魔', emoji: '😈', hp: 120, attack: 20, defense: 15, expReward: 80, goldReward: 50 },
  { id: 'dragon', name: '小龙', emoji: '🐉', hp: 200, attack: 30, defense: 20, expReward: 150, goldReward: 100 },
];

export const TRAP_TEMPLATES: TrapTemplate[] = [
  { id: 'spike', name: '尖刺陷阱', emoji: '📍', damage: 15, effect: 'damage' },
  { id: 'poison', name: '毒气陷阱', emoji: '☠️', damage: 10, effect: 'poison', duration: 3 },
  { id: 'fire', name: '火焰陷阱', emoji: '🔥', damage: 25, effect: 'damage' },
  { id: 'freeze', name: '冰冻陷阱', emoji: '❄️', damage: 5, effect: 'slow', duration: 2 },
];

export const TREASURE_TEMPLATES: TreasureTemplate[] = [
  { id: 'small_gold', name: '小钱袋', emoji: '💰', gold: 20 },
  { id: 'medium_gold', name: '金币箱', emoji: '🪙', gold: 50 },
  { id: 'large_gold', name: '宝藏箱', emoji: '👑', gold: 100 },
  { id: 'potion', name: '生命药水', emoji: '🧪', gold: 10, item: 'health_potion', effect: 'restore_50_hp' },
  { id: 'sword', name: '宝剑', emoji: '⚔️', gold: 30, item: 'sword', effect: 'attack_+10' },
  { id: 'shield', name: '盾牌', emoji: '🛡️', gold: 30, item: 'shield', effect: 'defense_+10' },
];

export const DEFAULT_HERO: Omit<Hero, 'position'> = {
  id: 'hero_1',
  name: '勇者',
  emoji: '🦸',
  hp: 100,
  maxHp: 100,
  attack: 15,
  defense: 10,
  level: 1,
  exp: 0,
  gold: 0,
  items: [],
};

export const EXP_PER_LEVEL = [0, 50, 120, 200, 350, 500, 750, 1000, 1500, 2000];

export function getExpRequired(level: number): number {
  return EXP_PER_LEVEL[level] || EXP_PER_LEVEL[EXP_PER_LEVEL.length - 1];
}
