import React from 'react';
import { Level, Hero, Position, Cell } from '../types/game';

interface GameBoardProps {
  level: Level;
  hero: Hero;
  path: Position[];
  currentStep: number;
}

export const GameBoard: React.FC<GameBoardProps> = ({ level, hero, path, currentStep }) => {
  const getCellContent = (cell: Cell, x: number, y: number): string => {
    if (hero.position.x === x && hero.position.y === y) {
      return hero.emoji;
    }
    switch (cell.type) {
      case 'start': return '🚪';
      case 'end': return '🏆';
      case 'monster': return cell.monster?.emoji || '👾';
      case 'trap': return cell.trap?.emoji || '⚠️';
      case 'treasure': return cell.treasure?.emoji || '📦';
      case 'wall': return '🧱';
      case 'floor': return '·';
      default: return '';
    }
  };

  const getCellBgColor = (cell: Cell, x: number, y: number): string => {
    if (hero.position.x === x && hero.position.y === y) {
      return 'bg-blue-600 ring-2 ring-blue-400';
    }

    const isInPath = path.some((p, index) => p.x === x && p.y === y && index <= currentStep);
    const isFuturePath = path.some((p, index) => p.x === x && p.y === y && index > currentStep);

    if (isInPath && cell.type !== 'empty' && cell.type !== 'wall') {
      return 'bg-green-800/50';
    }
    if (isFuturePath && cell.type !== 'empty' && cell.type !== 'wall') {
      return 'bg-blue-900/30';
    }

    switch (cell.type) {
      case 'start': return 'bg-green-600';
      case 'end': return 'bg-yellow-500';
      case 'wall': return 'bg-gray-700';
      case 'floor': return 'bg-stone-600';
      case 'monster': return 'bg-red-900';
      case 'trap': return 'bg-orange-900';
      case 'treasure': return 'bg-amber-700';
      default: return 'bg-gray-900';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-white font-bold mb-3">🗺️ 地牢地图</h3>
      <div
        className="inline-grid gap-1"
        style={{ gridTemplateColumns: `repeat(${level.width}, minmax(0, 1fr))` }}
      >
        {level.grid.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className={`w-10 h-10 flex items-center justify-center text-lg rounded transition-all ${getCellBgColor(cell, x, y)}`}
            >
              {getCellContent(cell, x, y)}
            </div>
          ))
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-blue-600 rounded"></span> 勇者
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-green-800/50 rounded"></span> 已走路径
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-blue-900/30 rounded"></span> 计划路径
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-stone-600 rounded"></span> 地板
        </span>
      </div>
    </div>
  );
};
