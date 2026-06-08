import { Level, Hero, Cell, Position, BattleLog, GameResult, Monster } from '../types/game';
import { DEFAULT_HERO, getExpRequired } from '../data/templates';

interface PathNode {
  position: Position;
  g: number;
  h: number;
  f: number;
  parent: PathNode | null;
}

function heuristic(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function getNeighbors(pos: Position, level: Level): Position[] {
  const directions = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
  ];

  return directions
    .map(d => ({ x: pos.x + d.x, y: pos.y + d.y }))
    .filter(p =>
      p.x >= 0 && p.x < level.width &&
      p.y >= 0 && p.y < level.height &&
      level.grid[p.y][p.x].type !== 'empty' &&
      level.grid[p.y][p.x].type !== 'wall'
    );
}

export function findPath(start: Position, end: Position, level: Level): Position[] {
  const openList: PathNode[] = [];
  const closedSet = new Set<string>();

  const startNode: PathNode = {
    position: start,
    g: 0,
    h: heuristic(start, end),
    f: heuristic(start, end),
    parent: null,
  };

  openList.push(startNode);

  while (openList.length > 0) {
    openList.sort((a, b) => a.f - b.f);
    const current = openList.shift()!;

    const posKey = `${current.position.x},${current.position.y}`;

    if (current.position.x === end.x && current.position.y === end.y) {
      const path: Position[] = [];
      let node: PathNode | null = current;
      while (node) {
        path.unshift(node.position);
        node = node.parent;
      }
      return path;
    }

    closedSet.add(posKey);

    for (const neighbor of getNeighbors(current.position, level)) {
      const neighborKey = `${neighbor.x},${neighbor.y}`;
      if (closedSet.has(neighborKey)) continue;

      const g = current.g + 1;
      const h = heuristic(neighbor, end);
      const f = g + h;

      const existingNode = openList.find(
        n => n.position.x === neighbor.x && n.position.y === neighbor.y
      );

      if (!existingNode) {
        openList.push({ position: neighbor, g, h, f, parent: current });
      } else if (g < existingNode.g) {
        existingNode.g = g;
        existingNode.f = f;
        existingNode.parent = current;
      }
    }
  }

  return [];
}

function createBattleLog(type: BattleLog['type'], message: string, hero?: Hero): BattleLog {
  return {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    type,
    message,
    heroHp: hero?.hp,
    heroMaxHp: hero?.maxHp,
  };
}

function calculateDamage(attackerAttack: number, defenderDefense: number): number {
  const baseDamage = Math.max(1, attackerAttack - defenderDefense / 2);
  const variance = 0.2;
  return Math.floor(baseDamage * (1 + (Math.random() - 0.5) * variance));
}

function battle(hero: Hero, monster: Monster, logs: BattleLog[]): { hero: Hero; monsterDead: boolean } {
  const heroDamage = calculateDamage(hero.attack, monster.defense);
  monster.hp -= heroDamage;
  logs.push(createBattleLog('battle', `${hero.emoji} ${hero.name} 对 ${monster.emoji} ${monster.name} 造成 ${heroDamage} 点伤害`, hero));

  if (monster.hp <= 0) {
    logs.push(createBattleLog('battle', `${monster.emoji} ${monster.name} 被击败了！`, hero));
    hero.exp += monster.expReward;
    hero.gold += monster.goldReward;
    logs.push(createBattleLog('battle', `获得 ${monster.expReward} 经验和 ${monster.goldReward} 金币`, hero));

    while (hero.exp >= getExpRequired(hero.level)) {
      hero.exp -= getExpRequired(hero.level);
      hero.level++;
      hero.maxHp += 20;
      hero.hp = Math.min(hero.hp + 20, hero.maxHp);
      hero.attack += 3;
      hero.defense += 2;
      logs.push(createBattleLog('levelup', `${hero.emoji} 升级了！当前等级: ${hero.level}`, hero));
    }

    return { hero, monsterDead: true };
  }

  const monsterDamage = calculateDamage(monster.attack, hero.defense);
  hero.hp -= monsterDamage;
  logs.push(createBattleLog('battle', `${monster.emoji} ${monster.name} 对 ${hero.emoji} ${hero.name} 造成 ${monsterDamage} 点伤害`, hero));

  return { hero, monsterDead: false };
}

export interface GameState {
  hero: Hero;
  level: Level;
  currentPath: Position[];
  currentStep: number;
  logs: BattleLog[];
  isRunning: boolean;
  isFinished: boolean;
  result: GameResult | null;
  stats: {
    monstersKilled: number;
    treasuresFound: number;
    trapsTriggered: number;
    steps: number;
  };
}

export function createInitialState(level: Level): GameState {
  const levelCopy: Level = JSON.parse(JSON.stringify(level));
  return {
    hero: {
      ...DEFAULT_HERO,
      position: { ...level.startPos },
    },
    level: levelCopy,
    currentPath: [],
    currentStep: 0,
    logs: [],
    isRunning: false,
    isFinished: false,
    result: null,
    stats: {
      monstersKilled: 0,
      treasuresFound: 0,
      trapsTriggered: 0,
      steps: 0,
    },
  };
}

export function initializeGame(state: GameState): GameState {
  const path = findPath(state.hero.position, state.level.endPos, state.level);
  
  if (path.length === 0) {
    const logs = [...state.logs];
    logs.push(createBattleLog('battle', '❌ 找不到通往终点的路径！请调整地牢布局。'));
    return { ...state, logs, isFinished: true, result: {
      victory: false,
      totalGold: state.hero.gold,
      totalExp: state.hero.exp,
      monstersKilled: state.stats.monstersKilled,
      treasuresFound: state.stats.treasuresFound,
      trapsTriggered: state.stats.trapsTriggered,
      steps: state.stats.steps,
      heroFinalHp: state.hero.hp,
      heroMaxHp: state.hero.maxHp,
    }};
  }

  const logs = [...state.logs];
  logs.push(createBattleLog('move', `${state.hero.emoji} ${state.hero.name} 开始冒险！`));
  
  return { ...state, currentPath: path, currentStep: 0, isRunning: true, logs };
}

function makeResult(victory: boolean, hero: Hero, stats: GameState['stats']): GameResult {
  return {
    victory,
    totalGold: hero.gold,
    totalExp: hero.exp,
    monstersKilled: stats.monstersKilled,
    treasuresFound: stats.treasuresFound,
    trapsTriggered: stats.trapsTriggered,
    steps: stats.steps,
    heroFinalHp: hero.hp <= 0 ? 0 : hero.hp,
    heroMaxHp: hero.maxHp,
  };
}

function finishGame(
  state: GameState,
  hero: Hero,
  level: Level,
  logs: BattleLog[],
  stats: GameState['stats'],
  victory: boolean,
  currentStepOverride?: number,
): GameState {
  return {
    ...state,
    hero,
    level,
    logs,
    stats,
    isRunning: false,
    isFinished: true,
    result: makeResult(victory, hero.hp <= 0 ? { ...hero, hp: 0 } : hero, stats),
    ...(currentStepOverride !== undefined ? { currentStep: currentStepOverride } : {}),
  };
}

export function processStep(state: GameState): GameState {
  if (!state.isRunning || state.isFinished) return state;

  const hero = { ...state.hero };
  const level = JSON.parse(JSON.stringify(state.level)) as Level;
  const logs = [...state.logs];
  const stats = { ...state.stats };

  const heroCell = level.grid[hero.position.y][hero.position.x];
  if (heroCell.type === 'monster' && heroCell.monster && heroCell.monster.hp > 0) {
    const battleResult = battle(hero, heroCell.monster, logs);

    if (hero.hp <= 0) {
      hero.hp = 0;
      logs.push(createBattleLog('death', `💀 ${hero.name} 倒下了...`, hero));
      return finishGame(state, hero, level, logs, stats, false);
    }

    if (battleResult.monsterDead) {
      stats.monstersKilled++;
      level.grid[hero.position.y][hero.position.x] = { type: 'floor' };
      return { ...state, hero, level, logs, stats, currentStep: state.currentStep + 1 };
    }

    return { ...state, hero, level, logs, stats };
  }

  if (state.currentStep >= state.currentPath.length - 1) {
    logs.push(createBattleLog('victory', '🎉 恭喜！勇者成功到达终点！', hero));
    return finishGame(state, hero, level, logs, stats, true);
  }

  const nextPos = state.currentPath[state.currentStep + 1];
  hero.position = nextPos;
  stats.steps++;

  const cell = level.grid[nextPos.y][nextPos.x];

  if (cell.type === 'monster' && cell.monster) {
    logs.push(createBattleLog('move', `遭遇了 ${cell.monster.emoji} ${cell.monster.name}！`, hero));
    const battleResult = battle(hero, cell.monster, logs);

    if (hero.hp <= 0) {
      hero.hp = 0;
      logs.push(createBattleLog('death', `💀 ${hero.name} 倒下了...`, hero));
      return finishGame(state, hero, level, logs, stats, false);
    }

    if (battleResult.monsterDead) {
      stats.monstersKilled++;
      level.grid[nextPos.y][nextPos.x] = { type: 'floor' };
      return { ...state, hero, level, logs, stats, currentStep: state.currentStep + 1 };
    }

    return { ...state, hero, level, logs, stats };
  }

  if (cell.type === 'trap' && cell.trap) {
    const trap = cell.trap;
    hero.hp -= trap.damage;
    stats.trapsTriggered++;
    logs.push(createBattleLog('trap', `触发了 ${trap.emoji} ${trap.name}！受到 ${trap.damage} 点伤害`, hero));
    level.grid[nextPos.y][nextPos.x] = { type: 'floor', trap };

    if (hero.hp <= 0) {
      hero.hp = 0;
      logs.push(createBattleLog('death', `💀 ${hero.name} 倒下了...`, hero));
      return finishGame(state, hero, level, logs, stats, false, state.currentStep + 1);
    }
  } else if (cell.type === 'treasure' && cell.treasure) {
    const treasure = cell.treasure;
    hero.gold += treasure.gold;
    stats.treasuresFound++;
    logs.push(createBattleLog('treasure', `发现了 ${treasure.emoji} ${treasure.name}！获得 ${treasure.gold} 金币`, hero));

    if (treasure.effect) {
      if (treasure.effect === 'restore_50_hp') {
        hero.hp = Math.min(hero.hp + 50, hero.maxHp);
        logs.push(createBattleLog('treasure', `使用生命药水恢复了 50 点生命值`, hero));
      } else if (treasure.effect === 'attack_+10') {
        hero.attack += 10;
        logs.push(createBattleLog('treasure', `装备宝剑，攻击力 +10`, hero));
      } else if (treasure.effect === 'defense_+10') {
        hero.defense += 10;
        logs.push(createBattleLog('treasure', `装备盾牌，防御力 +10`, hero));
      }
    }
    level.grid[nextPos.y][nextPos.x] = { type: 'floor' };
  } else if (cell.type === 'end') {
    logs.push(createBattleLog('victory', '🎉 恭喜！勇者成功到达终点！', hero));
    return finishGame(state, hero, level, logs, stats, true, state.currentStep + 1);
  }

  return {
    ...state,
    hero,
    level,
    logs,
    stats,
    currentStep: state.currentStep + 1,
  };
}
