import { Level, BattleLog, GameResult, Hero } from '../types/game';

const STORAGE_KEYS = {
  LEVELS: 'dungeon_levels',
  CURRENT_LEVEL: 'dungeon_current_level',
  HERO_DATA: 'dungeon_hero_data',
  BATTLE_LOGS: 'dungeon_battle_logs',
  GAME_RESULTS: 'dungeon_game_results',
};

export function saveToLocalStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return defaultValue;
  }
}

export function saveLevels(levels: Level[]): void {
  saveToLocalStorage(STORAGE_KEYS.LEVELS, levels);
}

export function loadLevels(): Level[] {
  return loadFromLocalStorage<Level[]>(STORAGE_KEYS.LEVELS, []);
}

export function saveCurrentLevel(level: Level): void {
  saveToLocalStorage(STORAGE_KEYS.CURRENT_LEVEL, level);
}

export function loadCurrentLevel(): Level | null {
  return loadFromLocalStorage<Level | null>(STORAGE_KEYS.CURRENT_LEVEL, null);
}

export function saveHero(hero: Hero): void {
  saveToLocalStorage(STORAGE_KEYS.HERO_DATA, hero);
}

export function loadHero(): Hero | null {
  return loadFromLocalStorage<Hero | null>(STORAGE_KEYS.HERO_DATA, null);
}

export function saveBattleLogs(logs: BattleLog[]): void {
  saveToLocalStorage(STORAGE_KEYS.BATTLE_LOGS, logs);
}

export function loadBattleLogs(): BattleLog[] {
  return loadFromLocalStorage<BattleLog[]>(STORAGE_KEYS.BATTLE_LOGS, []);
}

export function saveGameResults(results: GameResult[]): void {
  saveToLocalStorage(STORAGE_KEYS.GAME_RESULTS, results);
}

export function loadGameResults(): GameResult[] {
  return loadFromLocalStorage<GameResult[]>(STORAGE_KEYS.GAME_RESULTS, []);
}

export function exportToJSON(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importFromJSON<T>(file: File): Promise<T> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as T;
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
}
