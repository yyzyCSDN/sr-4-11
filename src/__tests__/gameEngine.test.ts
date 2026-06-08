import { describe, it, expect } from 'vitest';
import { Level, CellType, Monster, Position } from '../types/game';
import { createInitialState, initializeGame, processStep, GameState } from '../utils/gameEngine';

function makeLevel(opts: {
  width?: number;
  height?: number;
  startPos?: Position;
  endPos?: Position;
  monsterPositions?: { pos: Position; monster: Monster }[];
}): Level {
  const width = opts.width ?? 5;
  const height = opts.height ?? 1;
  const startPos = opts.startPos ?? { x: 0, y: 0 };
  const endPos = opts.endPos ?? { x: width - 1, y: 0 };

  const grid = Array(height)
    .fill(null)
    .map(() =>
      Array(width)
        .fill(null)
        .map(() => ({ type: 'floor' as CellType }))
    );

  grid[startPos.y][startPos.x] = { type: 'start' };
  grid[endPos.y][endPos.x] = { type: 'end' };

  if (opts.monsterPositions) {
    for (const { pos, monster } of opts.monsterPositions) {
      grid[pos.y][pos.x] = { type: 'monster', monster };
    }
  }

  return { id: 'test_level', name: 'test', width, height, grid, startPos, endPos };
}

function makeMonster(hp: number, attack: number, defense: number = 0): Monster {
  return {
    id: 'test_monster',
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

function runUntilFinished(state: GameState, maxSteps: number = 200): GameState {
  let s = state;
  for (let i = 0; i < maxSteps && s.isRunning && !s.isFinished; i++) {
    s = processStep(s);
  }
  return s;
}

describe('processStep - 多回合战斗', () => {
  it('怪物未被一击杀死时，勇者不会穿过怪物', () => {
    const level = makeLevel({
      width: 5,
      startPos: { x: 0, y: 0 },
      endPos: { x: 4, y: 0 },
      monsterPositions: [{ pos: { x: 2, y: 0 }, monster: makeMonster(200, 5, 5) }],
    });

    let state = initializeGame(createInitialState(level));

    state = processStep(state);
    const afterFirstStep = state;

    expect(afterFirstStep.currentStep).toBe(1);

    state = processStep(state);
    const afterEnteringCombat = state;

    expect(afterEnteringCombat.hero.position.x).toBe(2);
    expect(afterEnteringCombat.hero.position.y).toBe(0);

    const monsterCell = afterEnteringCombat.level.grid[0][2];
    expect(monsterCell.type).toBe('monster');
    expect(monsterCell.monster!.hp).toBeLessThan(monsterCell.monster!.maxHp);
    expect(monsterCell.monster!.hp).toBeGreaterThan(0);

    expect(afterEnteringCombat.isFinished).toBe(false);
    expect(afterEnteringCombat.isRunning).toBe(true);
    expect(afterEnteringCombat.stats.monstersKilled).toBe(0);
    expect(afterEnteringCombat.currentStep).toBe(afterFirstStep.currentStep);

    state = processStep(state);
    const afterAnotherRound = state;

    expect(afterAnotherRound.hero.position.x).toBe(2);
    expect(afterAnotherRound.hero.position.y).toBe(0);

    expect(afterAnotherRound.level.grid[0][2].type).toBe('monster');
    expect(afterAnotherRound.currentStep).toBe(afterFirstStep.currentStep);
  });

  it('怪物未死时持续战斗直到怪物死亡，之后勇者继续前进', () => {
    const level = makeLevel({
      width: 5,
      startPos: { x: 0, y: 0 },
      endPos: { x: 4, y: 0 },
      monsterPositions: [{ pos: { x: 2, y: 0 }, monster: makeMonster(40, 3, 2) }],
    });

    const state = runUntilFinished(initializeGame(createInitialState(level)));

    expect(state.result).not.toBeNull();
    expect(state.result!.victory).toBe(true);
    expect(state.stats.monstersKilled).toBe(1);

    const monsterCell = state.level.grid[0][2];
    expect(monsterCell.type).toBe('floor');

    expect(state.hero.hp).toBeGreaterThan(0);
  });

  it('勇者被怪物打死时立即失败结算', () => {
    const level = makeLevel({
      width: 3,
      startPos: { x: 0, y: 0 },
      endPos: { x: 2, y: 0 },
      monsterPositions: [{ pos: { x: 1, y: 0 }, monster: makeMonster(500, 200, 200) }],
    });

    const state = runUntilFinished(initializeGame(createInitialState(level)));

    expect(state.isFinished).toBe(true);
    expect(state.isRunning).toBe(false);
    expect(state.result).not.toBeNull();
    expect(state.result!.victory).toBe(false);
    expect(state.result!.heroFinalHp).toBe(0);
    expect(state.hero.hp).toBe(0);

    const deathLogs = state.logs.filter(l => l.type === 'death');
    expect(deathLogs.length).toBe(1);

    const battleLogs = state.logs.filter(l => l.type === 'battle');
    expect(battleLogs.length).toBeGreaterThan(0);
  });

  it('勇者被怪物打死时不会继续前进', () => {
    const level = makeLevel({
      width: 3,
      startPos: { x: 0, y: 0 },
      endPos: { x: 2, y: 0 },
      monsterPositions: [{ pos: { x: 1, y: 0 }, monster: makeMonster(500, 200, 200) }],
    });

    const state = runUntilFinished(initializeGame(createInitialState(level)));

    expect(state.hero.position.x).toBe(1);
    expect(state.hero.position.y).toBe(0);

    expect(state.stats.monstersKilled).toBe(0);
  });

  it('多怪物时每个怪物都需要被单独击败', () => {
    const level = makeLevel({
      width: 7,
      startPos: { x: 0, y: 0 },
      endPos: { x: 6, y: 0 },
      monsterPositions: [
        { pos: { x: 2, y: 0 }, monster: makeMonster(30, 3, 2) },
        { pos: { x: 4, y: 0 }, monster: makeMonster(30, 3, 2) },
      ],
    });

    const state = runUntilFinished(initializeGame(createInitialState(level)));

    expect(state.result!.victory).toBe(true);
    expect(state.stats.monstersKilled).toBe(2);
    expect(state.level.grid[0][2].type).toBe('floor');
    expect(state.level.grid[0][4].type).toBe('floor');
  });
});
