export interface Position {
  x: number;
  y: number;
}

export interface Monster {
  id: string;
  name: string;
  emoji: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  expReward: number;
  goldReward: number;
}

export interface Trap {
  id: string;
  name: string;
  emoji: string;
  damage: number;
  effect: 'damage' | 'slow' | 'poison';
  duration?: number;
}

export interface Treasure {
  id: string;
  name: string;
  emoji: string;
  gold: number;
  item?: string;
  effect?: string;
}

export interface Hero {
  id: string;
  name: string;
  emoji: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  level: number;
  exp: number;
  gold: number;
  position: Position;
  items: string[];
}

export type CellType = 'empty' | 'wall' | 'floor' | 'start' | 'end' | 'monster' | 'trap' | 'treasure';

export interface Cell {
  type: CellType;
  monster?: Monster;
  trap?: Trap;
  treasure?: Treasure;
  visited?: boolean;
}

export interface Level {
  id: string;
  name: string;
  width: number;
  height: number;
  grid: Cell[][];
  startPos: Position;
  endPos: Position;
}

export interface BattleLog {
  id: string;
  timestamp: number;
  type: 'move' | 'battle' | 'trap' | 'treasure' | 'levelup' | 'death' | 'victory';
  message: string;
  heroHp?: number;
  heroMaxHp?: number;
}

export interface GameResult {
  victory: boolean;
  totalGold: number;
  totalExp: number;
  monstersKilled: number;
  treasuresFound: number;
  trapsTriggered: number;
  steps: number;
  heroFinalHp: number;
  heroMaxHp: number;
}

export interface MonsterTemplate {
  id: string;
  name: string;
  emoji: string;
  hp: number;
  attack: number;
  defense: number;
  expReward: number;
  goldReward: number;
}

export interface TrapTemplate {
  id: string;
  name: string;
  emoji: string;
  damage: number;
  effect: 'damage' | 'slow' | 'poison';
  duration?: number;
}

export interface TreasureTemplate {
  id: string;
  name: string;
  emoji: string;
  gold: number;
  item?: string;
  effect?: string;
}
