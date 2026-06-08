import { Level, Position } from '../types/game';
import { findPath } from './gameEngine';
import { DEFAULT_HERO } from '../data/templates';

export type CheckSeverity = 'error' | 'warning' | 'success';

export interface CheckItem {
  key: string;
  label: string;
  severity: CheckSeverity;
  message: string;
}

export interface LevelCheckupResult {
  items: CheckItem[];
  canForceStart: boolean;
}

function checkStartEnd(level: Level): CheckItem[] {
  const items: CheckItem[] = [];
  const startCell = level.grid[level.startPos.y]?.[level.startPos.x];
  const endCell = level.grid[level.endPos.y]?.[level.endPos.x];

  if (!startCell || startCell.type !== 'start') {
    items.push({
      key: 'start',
      label: '起点检查',
      severity: 'error',
      message: '起点位置无效，请确保地图上存在起点（🚪）',
    });
  } else {
    items.push({
      key: 'start',
      label: '起点检查',
      severity: 'success',
      message: '起点设置正常',
    });
  }

  if (!endCell || endCell.type !== 'end') {
    items.push({
      key: 'end',
      label: '终点检查',
      severity: 'error',
      message: '终点位置无效，请确保地图上存在终点（🏆）',
    });
  } else {
    items.push({
      key: 'end',
      label: '终点检查',
      severity: 'success',
      message: '终点设置正常',
    });
  }

  return items;
}

function checkPath(level: Level, path: Position[]): CheckItem {

  if (path.length === 0) {
    return {
      key: 'path',
      label: '路径检查',
      severity: 'error',
      message: '无法找到从起点到终点的可达路径，请检查墙壁是否封死了通路',
    };
  }

  if (path.length < 5) {
    return {
      key: 'path',
      label: '路径检查',
      severity: 'warning',
      message: `路径过短（仅 ${path.length} 步），关卡可能缺少挑战性`,
    };
  }

  return {
    key: 'path',
    label: '路径检查',
    severity: 'success',
    message: `路径畅通，共 ${path.length} 步`,
  };
}

function checkMonsterStrength(level: Level, pathSet: Set<string>): CheckItem {
  let totalMonsterHp = 0;
  let totalMonsterAttack = 0;
  let monsterCount = 0;

  for (let y = 0; y < level.grid.length; y++) {
    for (let x = 0; x < level.grid[y].length; x++) {
      const cell = level.grid[y][x];
      if (cell.type === 'monster' && cell.monster && pathSet.has(`${x},${y}`)) {
        totalMonsterHp += cell.monster.hp;
        totalMonsterAttack += cell.monster.attack;
        monsterCount++;
      }
    }
  }

  if (monsterCount === 0) {
    return {
      key: 'monster',
      label: '怪物强度',
      severity: 'warning',
      message: '关卡中没有任何怪物，冒险将缺乏挑战',
    };
  }

  const heroHp = DEFAULT_HERO.hp;
  const heroAttack = DEFAULT_HERO.attack;
  const heroDefense = DEFAULT_HERO.defense;
  const avgMonsterAttack = totalMonsterAttack / monsterCount;

  const damagePerMonster = Math.max(1, avgMonsterAttack - heroDefense / 2);
  const estimatedTotalDamage = damagePerMonster * monsterCount * 2;
  const ratio = estimatedTotalDamage / heroHp;

  if (ratio > 2.5) {
    return {
      key: 'monster',
      label: '怪物强度',
      severity: 'error',
      message: `怪物强度过高！${monsterCount} 只怪物预估总伤害 ${Math.round(estimatedTotalDamage)}，远超勇者生命值 ${heroHp}，几乎无法通关`,
    };
  }

  if (ratio > 1.5) {
    return {
      key: 'monster',
      label: '怪物强度',
      severity: 'warning',
      message: `怪物强度偏高：${monsterCount} 只怪物预估总伤害 ${Math.round(estimatedTotalDamage)}，勇者生命值 ${heroHp}，通关难度较大`,
    };
  }

  const turnsPerMonster = Math.ceil(totalMonsterHp / monsterCount / Math.max(1, heroAttack));
  if (turnsPerMonster > 5) {
    return {
      key: 'monster',
      label: '怪物强度',
      severity: 'warning',
      message: `怪物血量偏高，平均每只需 ${turnsPerMonster} 回合击杀，战斗节奏偏慢`,
    };
  }

  return {
    key: 'monster',
    label: '怪物强度',
    severity: 'success',
    message: `怪物强度适中：${monsterCount} 只怪物，预估总伤害 ${Math.round(estimatedTotalDamage)}`,
  };
}

function checkTrapDensity(level: Level, pathSet: Set<string>): CheckItem {
  let trapCount = 0;
  let totalTrapDamage = 0;
  let pathFloorCount = 0;

  for (let y = 0; y < level.grid.length; y++) {
    for (let x = 0; x < level.grid[y].length; x++) {
      const cell = level.grid[y][x];
      if (!pathSet.has(`${x},${y}`)) continue;
      if (cell.type === 'trap' && cell.trap) {
        trapCount++;
        totalTrapDamage += cell.trap.damage;
      }
      if (cell.type === 'floor' || cell.type === 'start' || cell.type === 'end') {
        pathFloorCount++;
      }
    }
  }

  if (trapCount === 0) {
    return {
      key: 'trap',
      label: '陷阱密度',
      severity: 'success',
      message: '关卡中没有陷阱',
    };
  }

  const density = trapCount / Math.max(1, pathFloorCount);

  if (density > 0.3) {
    return {
      key: 'trap',
      label: '陷阱密度',
      severity: 'error',
      message: `陷阱密度过高！${trapCount} 个陷阱占据 ${Math.round(density * 100)}% 的可行走区域，总伤害 ${totalTrapDamage}，勇者寸步难行`,
    };
  }

  if (density > 0.15) {
    return {
      key: 'trap',
      label: '陷阱密度',
      severity: 'warning',
      message: `陷阱密度偏高：${trapCount} 个陷阱，占比 ${Math.round(density * 100)}%，总伤害 ${totalTrapDamage}`,
    };
  }

  return {
    key: 'trap',
    label: '陷阱密度',
    severity: 'success',
    message: `陷阱密度适中：${trapCount} 个陷阱，总伤害 ${totalTrapDamage}`,
  };
}

function checkTreasureCompensation(level: Level, pathSet: Set<string>): CheckItem {
  let treasureCount = 0;
  let totalGold = 0;
  let hasHealing = false;
  let trapDamage = 0;
  let estimatedMonsterDamage = 0;
  const heroDefense = DEFAULT_HERO.defense;

  for (let y = 0; y < level.grid.length; y++) {
    for (let x = 0; x < level.grid[y].length; x++) {
      const cell = level.grid[y][x];
      if (!pathSet.has(`${x},${y}`)) continue;
      if (cell.type === 'treasure' && cell.treasure) {
        treasureCount++;
        totalGold += cell.treasure.gold;
        if (cell.treasure.effect === 'restore_50_hp') {
          hasHealing = true;
        }
      }
      if (cell.type === 'trap' && cell.trap) {
        trapDamage += cell.trap.damage;
      }
      if (cell.type === 'monster' && cell.monster) {
        const dmgPerRound = Math.max(1, cell.monster.attack - heroDefense / 2);
        const rounds = Math.ceil(cell.monster.hp / Math.max(1, DEFAULT_HERO.attack));
        estimatedMonsterDamage += dmgPerRound * rounds;
      }
    }
  }

  const totalDanger = trapDamage + estimatedMonsterDamage;

  if (totalDanger === 0 && treasureCount === 0) {
    return {
      key: 'treasure',
      label: '宝箱补偿',
      severity: 'success',
      message: '关卡风险与奖励均为零，适合入门练习',
    };
  }

  if (totalDanger === 0 && treasureCount > 0) {
    return {
      key: 'treasure',
      label: '宝箱补偿',
      severity: 'success',
      message: `关卡无危险，${treasureCount} 个宝箱共 ${totalGold} 金币`,
    };
  }

  if (treasureCount === 0 && totalDanger > 0) {
    return {
      key: 'treasure',
      label: '宝箱补偿',
      severity: 'warning',
      message: `关卡存在风险（预估伤害 ${Math.round(totalDanger)}）但没有任何宝箱补偿，建议添加宝箱或药水`,
    };
  }

  const compensationRatio = totalGold / totalDanger;

  if (!hasHealing && totalDanger > DEFAULT_HERO.hp * 0.6) {
    return {
      key: 'treasure',
      label: '宝箱补偿',
      severity: 'warning',
      message: `关卡危险度高（预估伤害 ${Math.round(totalDanger)}）但缺少生命药水，勇者可能无法存活`,
    };
  }

  if (compensationRatio < 0.3) {
    return {
      key: 'treasure',
      label: '宝箱补偿',
      severity: 'warning',
      message: `宝箱补偿偏低：${treasureCount} 个宝箱共 ${totalGold} 金币，对比预估伤害 ${Math.round(totalDanger)} 略显不足`,
    };
  }

  return {
    key: 'treasure',
    label: '宝箱补偿',
    severity: 'success',
    message: `宝箱补偿合理：${treasureCount} 个宝箱共 ${totalGold} 金币${hasHealing ? '，含生命药水' : ''}`,
  };
}

export function runLevelCheckup(level: Level): LevelCheckupResult {
  const path = findPath(level.startPos, level.endPos, level);
  const pathSet = new Set(path.map(p => `${p.x},${p.y}`));

  const items: CheckItem[] = [
    ...checkStartEnd(level),
    checkPath(level, path),
    checkMonsterStrength(level, pathSet),
    checkTrapDensity(level, pathSet),
    checkTreasureCompensation(level, pathSet),
  ];

  const hasError = items.some(item => item.severity === 'error');
  const hasPathError = items.some(item => item.key === 'path' && item.severity === 'error');
  const hasStartEndError = items.some(item => (item.key === 'start' || item.key === 'end') && item.severity === 'error');

  const canForceStart = !hasPathError && !hasStartEndError;

  return { items, canForceStart };
}
