import { describe, it, expect } from 'vitest';
import { Level, CellType, Monster, Trap, Treasure } from '../types/game';
import { runLevelCheckup } from '../utils/levelCheckup';

function makeLevel(opts: {
  width?: number;
  height?: number;
  startPos?: { x: number; y: number };
  endPos?: { x: number; y: number };
  walls?: { x: number; y: number }[];
  monsters?: { pos: { x: number; y: number }; monster: Monster }[];
  traps?: { pos: { x: number; y: number }; trap: Trap }[];
  treasures?: { pos: { x: number; y: number }; treasure: Treasure }[];
}): Level {
  const width = opts.width ?? 10;
  const height = opts.height ?? 8;
  const startPos = opts.startPos ?? { x: 1, y: 1 };
  const endPos = opts.endPos ?? { x: width - 2, y: height - 2 };

  const grid = Array(height)
    .fill(null)
    .map((_, y) =>
      Array(width)
        .fill(null)
        .map((_, x) => {
          if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
            return { type: 'wall' as CellType };
          }
          return { type: 'floor' as CellType };
        })
    );

  grid[startPos.y][startPos.x] = { type: 'start' };
  grid[endPos.y][endPos.x] = { type: 'end' };

  for (const w of opts.walls ?? []) {
    grid[w.y][w.x] = { type: 'wall' };
  }
  for (const m of opts.monsters ?? []) {
    grid[m.pos.y][m.pos.x] = { type: 'monster', monster: m.monster };
  }
  for (const t of opts.traps ?? []) {
    grid[t.pos.y][t.pos.x] = { type: 'trap', trap: t.trap };
  }
  for (const tr of opts.treasures ?? []) {
    grid[tr.pos.y][tr.pos.x] = { type: 'treasure', treasure: tr.treasure };
  }

  return { id: 'test_level', name: 'test', width, height, grid, startPos, endPos };
}

function makeMonster(hp: number, attack: number, defense: number = 0): Monster {
  return {
    id: `monster_${Date.now()}_${Math.random()}`,
    name: 'TestMonster',
    emoji: '👾',
    hp,
    maxHp: hp,
    attack,
    defense,
    expReward: 10,
    goldReward: 5,
  };
}

function makeTrap(damage: number): Trap {
  return {
    id: `trap_${Date.now()}_${Math.random()}`,
    name: 'TestTrap',
    emoji: '⚠️',
    damage,
    effect: 'damage',
  };
}

function makeTreasure(gold: number, effect?: string): Treasure {
  return {
    id: `treasure_${Date.now()}_${Math.random()}`,
    name: 'TestTreasure',
    emoji: '📦',
    gold,
    effect,
  };
}

describe('runLevelCheckup - 只统计路径上的对象', () => {
  it('路径外的怪物不应被计入怪物强度', () => {
    const onPathMonster = makeMonster(30, 5, 2);
    const offPathMonster = makeMonster(200, 30, 20);

    const level = makeLevel({
      width: 10,
      height: 8,
      startPos: { x: 1, y: 1 },
      endPos: { x: 8, y: 6 },
      walls: [
        { x: 1, y: 2 },
        { x: 1, y: 3 },
        { x: 1, y: 4 },
        { x: 1, y: 5 },
        { x: 1, y: 6 },
      ],
      monsters: [
        { pos: { x: 4, y: 1 }, monster: onPathMonster },
        { pos: { x: 2, y: 5 }, monster: offPathMonster },
      ],
    });

    const result = runLevelCheckup(level);

    const monsterItem = result.items.find(i => i.key === 'monster')!;
    expect(monsterItem.severity).toBe('success');
    expect(monsterItem.message).toContain('1 只怪物');
    expect(monsterItem.message).not.toContain('2 只怪物');
  });

  it('路径外的陷阱不应被计入陷阱密度', () => {
    const level = makeLevel({
      width: 10,
      height: 8,
      startPos: { x: 1, y: 1 },
      endPos: { x: 8, y: 6 },
      walls: [
        { x: 1, y: 2 },
        { x: 1, y: 3 },
        { x: 1, y: 4 },
        { x: 1, y: 5 },
        { x: 1, y: 6 },
      ],
      traps: [
        { pos: { x: 5, y: 1 }, trap: makeTrap(15) },
        { pos: { x: 2, y: 5 }, trap: makeTrap(25) },
      ],
    });

    const result = runLevelCheckup(level);

    const trapItem = result.items.find(i => i.key === 'trap')!;
    expect(trapItem.message).toContain('1 个陷阱');
    expect(trapItem.message).not.toContain('2 个陷阱');
  });

  it('路径外的宝箱不应被计入宝箱补偿', () => {
    const level = makeLevel({
      width: 10,
      height: 8,
      startPos: { x: 1, y: 1 },
      endPos: { x: 8, y: 6 },
      walls: [
        { x: 1, y: 2 },
        { x: 1, y: 3 },
        { x: 1, y: 4 },
        { x: 1, y: 5 },
        { x: 1, y: 6 },
      ],
      monsters: [
        { pos: { x: 4, y: 1 }, monster: makeMonster(30, 5, 2) },
      ],
      treasures: [
        { pos: { x: 6, y: 1 }, treasure: makeTreasure(50) },
        { pos: { x: 3, y: 5 }, treasure: makeTreasure(100) },
      ],
    });

    const result = runLevelCheckup(level);

    const treasureItem = result.items.find(i => i.key === 'treasure')!;
    expect(treasureItem.message).toContain('1 个宝箱');
    expect(treasureItem.message).toContain('50 金币');
    expect(treasureItem.message).not.toContain('2 个宝箱');
    expect(treasureItem.message).not.toContain('150 金币');
  });

  it('路径外同时有怪物、陷阱、宝箱时都不应被统计', () => {
    const level = makeLevel({
      width: 10,
      height: 8,
      startPos: { x: 1, y: 1 },
      endPos: { x: 8, y: 6 },
      walls: [
        { x: 1, y: 2 },
        { x: 1, y: 3 },
        { x: 1, y: 4 },
        { x: 1, y: 5 },
        { x: 1, y: 6 },
      ],
      monsters: [
        { pos: { x: 4, y: 1 }, monster: makeMonster(30, 5, 2) },
        { pos: { x: 2, y: 5 }, monster: makeMonster(200, 30, 20) },
      ],
      traps: [
        { pos: { x: 5, y: 1 }, trap: makeTrap(15) },
        { pos: { x: 3, y: 5 }, trap: makeTrap(25) },
      ],
      treasures: [
        { pos: { x: 6, y: 1 }, treasure: makeTreasure(50) },
        { pos: { x: 4, y: 5 }, treasure: makeTreasure(100) },
      ],
    });

    const result = runLevelCheckup(level);

    const monsterItem = result.items.find(i => i.key === 'monster')!;
    expect(monsterItem.message).toContain('1 只怪物');

    const trapItem = result.items.find(i => i.key === 'trap')!;
    expect(trapItem.message).toContain('1 个陷阱');

    const treasureItem = result.items.find(i => i.key === 'treasure')!;
    expect(treasureItem.message).toContain('1 个宝箱');
  });

  it('无路径时怪物强度报告仍能运行', () => {
    const level = makeLevel({
      width: 5,
      height: 3,
      startPos: { x: 1, y: 1 },
      endPos: { x: 3, y: 1 },
      walls: [
        { x: 2, y: 1 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
      ],
    });

    const result = runLevelCheckup(level);

    const pathItem = result.items.find(i => i.key === 'path')!;
    expect(pathItem.severity).toBe('error');
    expect(result.canForceStart).toBe(false);
  });
});
