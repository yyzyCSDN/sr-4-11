import React, { useState, useCallback } from 'react';
import { Level, Cell, CellType, Position, Monster, Trap, Treasure } from '../types/game';
import { MONSTER_TEMPLATES, TRAP_TEMPLATES, TREASURE_TEMPLATES } from '../data/templates';

type ToolType = CellType | 'eraser';

interface MapEditorProps {
  level: Level;
  onChange: (level: Level) => void;
}

export const MapEditor: React.FC<MapEditorProps> = ({ level, onChange }) => {
  const [selectedTool, setSelectedTool] = useState<ToolType>('floor');
  const [selectedMonster, setSelectedMonster] = useState(MONSTER_TEMPLATES[0]);
  const [selectedTrap, setSelectedTrap] = useState(TRAP_TEMPLATES[0]);
  const [selectedTreasure, setSelectedTreasure] = useState(TREASURE_TEMPLATES[0]);
  const [isSettingStart, setIsSettingStart] = useState(false);
  const [isSettingEnd, setIsSettingEnd] = useState(false);

  const createEmptyGrid = useCallback((width: number, height: number): Cell[][] => {
    return Array(height).fill(null).map(() =>
      Array(width).fill(null).map(() => ({ type: 'empty' as CellType }))
    );
  }, []);

  const handleCellClick = (x: number, y: number) => {
    if (isSettingStart) {
      const newGrid = level.grid.map(row => row.map(cell => ({ ...cell })));
      newGrid[level.startPos.y][level.startPos.x] = { type: 'floor' };
      newGrid[y][x] = { type: 'start' };
      onChange({ ...level, grid: newGrid, startPos: { x, y } });
      setIsSettingStart(false);
      return;
    }

    if (isSettingEnd) {
      const newGrid = level.grid.map(row => row.map(cell => ({ ...cell })));
      newGrid[level.endPos.y][level.endPos.x] = { type: 'floor' };
      newGrid[y][x] = { type: 'end' };
      onChange({ ...level, grid: newGrid, endPos: { x, y } });
      setIsSettingEnd(false);
      return;
    }

    const newGrid = level.grid.map(row => row.map(cell => ({ ...cell })));

    if (selectedTool === 'eraser') {
      newGrid[y][x] = { type: 'empty' };
    } else if (selectedTool === 'floor' || selectedTool === 'wall') {
      newGrid[y][x] = { type: selectedTool };
    } else if (selectedTool === 'monster') {
      const monster: Monster = {
        ...selectedMonster,
        id: `${selectedMonster.id}_${Date.now()}`,
        maxHp: selectedMonster.hp,
      };
      newGrid[y][x] = { type: 'monster', monster };
    } else if (selectedTool === 'trap') {
      const trap: Trap = {
        ...selectedTrap,
        id: `${selectedTrap.id}_${Date.now()}`,
      };
      newGrid[y][x] = { type: 'trap', trap };
    } else if (selectedTool === 'treasure') {
      const treasure: Treasure = {
        ...selectedTreasure,
        id: `${selectedTreasure.id}_${Date.now()}`,
      };
      newGrid[y][x] = { type: 'treasure', treasure };
    }

    onChange({ ...level, grid: newGrid });
  };

  const resizeLevel = (newWidth: number, newHeight: number) => {
    const newGrid = createEmptyGrid(newWidth, newHeight);
    const minWidth = Math.min(level.width, newWidth);
    const minHeight = Math.min(level.height, newHeight);

    for (let y = 0; y < minHeight; y++) {
      for (let x = 0; x < minWidth; x++) {
        newGrid[y][x] = { ...level.grid[y][x] };
      }
    }

    const startPos: Position = level.startPos.x < newWidth && level.startPos.y < newHeight
      ? level.startPos
      : { x: 0, y: 0 };
    const endPos: Position = level.endPos.x < newWidth && level.endPos.y < newHeight
      ? level.endPos
      : { x: newWidth - 1, y: newHeight - 1 };

    if (newGrid[startPos.y][startPos.x].type === 'empty') {
      newGrid[startPos.y][startPos.x] = { type: 'start' };
    }
    if (newGrid[endPos.y][endPos.x].type === 'empty') {
      newGrid[endPos.y][endPos.x] = { type: 'end' };
    }

    onChange({ ...level, width: newWidth, height: newHeight, grid: newGrid, startPos, endPos });
  };

  const getCellContent = (cell: Cell): string => {
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

  const getCellBgColor = (cell: Cell): string => {
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

  const tools: { type: ToolType; label: string; emoji: string }[] = [
    { type: 'floor', label: '地板', emoji: '⬜' },
    { type: 'wall', label: '墙壁', emoji: '🧱' },
    { type: 'monster', label: '怪物', emoji: '👾' },
    { type: 'trap', label: '陷阱', emoji: '⚠️' },
    { type: 'treasure', label: '宝箱', emoji: '📦' },
    { type: 'eraser', label: '橡皮擦', emoji: '🗑️' },
  ];

  return (
    <div className="flex gap-6">
      <div className="flex-1">
        <div className="mb-4 flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-300">
            宽度:
            <input
              type="number"
              min="5"
              max="20"
              value={level.width}
              onChange={(e) => resizeLevel(parseInt(e.target.value) || 5, level.height)}
              className="w-16 px-2 py-1 bg-gray-700 rounded text-white"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            高度:
            <input
              type="number"
              min="5"
              max="15"
              value={level.height}
              onChange={(e) => resizeLevel(level.width, parseInt(e.target.value) || 5)}
              className="w-16 px-2 py-1 bg-gray-700 rounded text-white"
            />
          </label>
          <button
            onClick={() => { setIsSettingStart(true); setIsSettingEnd(false); }}
            className={`px-3 py-1 rounded text-sm ${isSettingStart ? 'bg-green-500' : 'bg-gray-600 hover:bg-gray-500'}`}
          >
            🚪 设置起点
          </button>
          <button
            onClick={() => { setIsSettingEnd(true); setIsSettingStart(false); }}
            className={`px-3 py-1 rounded text-sm ${isSettingEnd ? 'bg-yellow-500' : 'bg-gray-600 hover:bg-gray-500'}`}
          >
            🏆 设置终点
          </button>
        </div>

        <div
          className="inline-grid gap-1 p-4 bg-gray-800 rounded-lg"
          style={{ gridTemplateColumns: `repeat(${level.width}, minmax(0, 1fr))` }}
        >
          {level.grid.map((row, y) =>
            row.map((cell, x) => (
              <button
                key={`${x}-${y}`}
                onClick={() => handleCellClick(x, y)}
                className={`w-10 h-10 flex items-center justify-center text-lg rounded transition-all hover:scale-105 hover:ring-2 ring-white/30 ${getCellBgColor(cell)} ${
                  isSettingStart || isSettingEnd ? 'cursor-crosshair' : ''
                }`}
              >
                {getCellContent(cell)}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="w-64 space-y-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-white font-bold mb-3">工具栏</h3>
          <div className="grid grid-cols-3 gap-2">
            {tools.map((tool) => (
              <button
                key={tool.type}
                onClick={() => {
                  setSelectedTool(tool.type);
                  setIsSettingStart(false);
                  setIsSettingEnd(false);
                }}
                className={`p-2 rounded text-center transition-all ${
                  selectedTool === tool.type
                    ? 'bg-blue-600 ring-2 ring-blue-400'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <div className="text-xl">{tool.emoji}</div>
                <div className="text-xs text-gray-300 mt-1">{tool.label}</div>
              </button>
            ))}
          </div>
        </div>

        {selectedTool === 'monster' && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-white font-bold mb-3">选择怪物</h3>
            <div className="space-y-2">
              {MONSTER_TEMPLATES.map((monster) => (
                <button
                  key={monster.id}
                  onClick={() => setSelectedMonster(monster)}
                  className={`w-full p-2 rounded flex items-center gap-3 transition-all ${
                    selectedMonster.id === monster.id
                      ? 'bg-red-700 ring-2 ring-red-400'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <span className="text-2xl">{monster.emoji}</span>
                  <div className="text-left text-sm">
                    <div className="text-white font-medium">{monster.name}</div>
                    <div className="text-gray-400 text-xs">
                      HP:{monster.hp} 攻:{monster.attack} 防:{monster.defense}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedTool === 'trap' && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-white font-bold mb-3">选择陷阱</h3>
            <div className="space-y-2">
              {TRAP_TEMPLATES.map((trap) => (
                <button
                  key={trap.id}
                  onClick={() => setSelectedTrap(trap)}
                  className={`w-full p-2 rounded flex items-center gap-3 transition-all ${
                    selectedTrap.id === trap.id
                      ? 'bg-orange-700 ring-2 ring-orange-400'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <span className="text-2xl">{trap.emoji}</span>
                  <div className="text-left text-sm">
                    <div className="text-white font-medium">{trap.name}</div>
                    <div className="text-gray-400 text-xs">
                      伤害:{trap.damage} 效果:{trap.effect}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedTool === 'treasure' && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-white font-bold mb-3">选择宝物</h3>
            <div className="space-y-2">
              {TREASURE_TEMPLATES.map((treasure) => (
                <button
                  key={treasure.id}
                  onClick={() => setSelectedTreasure(treasure)}
                  className={`w-full p-2 rounded flex items-center gap-3 transition-all ${
                    selectedTreasure.id === treasure.id
                      ? 'bg-amber-700 ring-2 ring-amber-400'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <span className="text-2xl">{treasure.emoji}</span>
                  <div className="text-left text-sm">
                    <div className="text-white font-medium">{treasure.name}</div>
                    <div className="text-gray-400 text-xs">
                      金币:{treasure.gold} {treasure.item ? `道具:${treasure.item}` : ''}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {(isSettingStart || isSettingEnd) && (
          <div className="bg-blue-900 rounded-lg p-4 text-center">
            <p className="text-blue-200">
              {isSettingStart ? '点击格子设置起点' : '点击格子设置终点'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
