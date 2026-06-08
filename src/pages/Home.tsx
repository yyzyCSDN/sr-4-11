import React, { useState, useEffect, useCallback } from 'react';
import { Level, CellType } from '../types/game';
import { MapEditor } from '../components/MapEditor';
import { HeroStatus } from '../components/HeroStatus';
import { BattleLogPanel } from '../components/BattleLogPanel';
import { GameBoard } from '../components/GameBoard';
import { GameResultModal } from '../components/GameResultModal';
import { createInitialState, initializeGame, processStep, GameState } from '../utils/gameEngine';
import { saveLevels, loadLevels, exportToJSON, importFromJSON } from '../utils/storage';

const createEmptyLevel = (): Level => {
  const width = 10;
  const height = 8;
  const grid = Array(height).fill(null).map(() =>
    Array(width).fill(null).map(() => ({ type: 'empty' as CellType }))
  );

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
        grid[y][x] = { type: 'wall' };
      } else {
        grid[y][x] = { type: 'floor' };
      }
    }
  }

  grid[1][1] = { type: 'start' };
  grid[height - 2][width - 2] = { type: 'end' };

  return {
    id: `level_${Date.now()}`,
    name: '我的地牢',
    width,
    height,
    grid,
    startPos: { x: 1, y: 1 },
    endPos: { x: width - 2, y: height - 2 },
  };
};

export default function Home() {
  const [mode, setMode] = useState<'editor' | 'game'>('editor');
  const [level, setLevel] = useState<Level>(createEmptyLevel);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(500);
  const [levels, setLevels] = useState<Level[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    const savedLevels = loadLevels();
    setLevels(savedLevels);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || !gameState || !gameState.isRunning || gameState.isFinished) {
      return;
    }

    const timer = setInterval(() => {
      setGameState(prev => prev ? processStep(prev) : null);
    }, gameSpeed);

    return () => clearInterval(timer);
  }, [isAutoPlaying, gameState, gameSpeed]);

  useEffect(() => {
    if (gameState?.isFinished) {
      setIsAutoPlaying(false);
    }
  }, [gameState?.isFinished]);

  const startGame = useCallback(() => {
    const initialState = createInitialState(level);
    const initialized = initializeGame(initialState);
    setGameState(initialized);
    setMode('game');
    setIsAutoPlaying(false);
  }, [level]);

  const handleStep = () => {
    if (gameState && gameState.isRunning && !gameState.isFinished) {
      setGameState(processStep(gameState));
    }
  };

  const handleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const handleBackToEditor = () => {
    setMode('editor');
    setGameState(null);
    setIsAutoPlaying(false);
  };

  const handleRetry = () => {
    startGame();
  };

  const handleSaveLevel = () => {
    const newLevels = [...levels.filter(l => l.id !== level.id), { ...level }];
    setLevels(newLevels);
    saveLevels(newLevels);
    setShowSaveModal(false);
  };

  const handleLoadLevel = (levelToLoad: Level) => {
    setLevel(levelToLoad);
  };

  const handleExport = () => {
    exportToJSON(level, `${level.name}_${Date.now()}.json`);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importFromJSON<Level>(file).then((importedLevel) => {
        setLevel({ ...importedLevel, id: `level_${Date.now()}` });
      }).catch(() => {
        alert('导入失败，请检查文件格式');
      });
    }
  };

  const handleNewLevel = () => {
    setLevel(createEmptyLevel());
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏰</span>
            <h1 className="text-2xl font-bold">地牢建造师</h1>
          </div>

          <div className="flex items-center gap-3">
            {mode === 'editor' ? (
              <>
                <button
                  onClick={handleNewLevel}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  🆕 新建
                </button>
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  💾 保存
                </button>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  📤 导出JSON
                </button>
                <label className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors cursor-pointer">
                  📥 导入JSON
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
                {levels.length > 0 && (
                  <select
                    onChange={(e) => {
                      const selected = levels.find(l => l.id === e.target.value);
                      if (selected) handleLoadLevel(selected);
                    }}
                    className="px-4 py-2 bg-gray-700 rounded-lg border-0"
                    defaultValue=""
                  >
                    <option value="" disabled>加载存档</option>
                    {levels.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                )}
                <button
                  onClick={startGame}
                  className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-bold transition-colors"
                >
                  ▶️ 开始测试
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleStep}
                  disabled={!gameState?.isRunning || gameState?.isFinished}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  ⏭️ 下一步
                </button>
                <button
                  onClick={handleAutoPlay}
                  disabled={gameState?.isFinished}
                  className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                    isAutoPlaying
                      ? 'bg-red-600 hover:bg-red-500'
                      : 'bg-green-600 hover:bg-green-500'
                  } disabled:bg-gray-600 disabled:cursor-not-allowed`}
                >
                  {isAutoPlaying ? '⏸️ 暂停' : '▶️ 自动播放'}
                </button>
                <select
                  value={gameSpeed}
                  onChange={(e) => setGameSpeed(Number(e.target.value))}
                  className="px-4 py-2 bg-gray-700 rounded-lg border-0"
                >
                  <option value={1000}>慢速</option>
                  <option value={500}>正常</option>
                  <option value={200}>快速</option>
                  <option value={50}>极速</option>
                </select>
                <button
                  onClick={handleBackToEditor}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                >
                  ✏️ 返回编辑
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {mode === 'editor' ? (
          <div>
            <div className="mb-4 flex items-center gap-4">
              <label className="flex items-center gap-2">
                <span className="text-gray-400">关卡名称:</span>
                <input
                  type="text"
                  value={level.name}
                  onChange={(e) => setLevel({ ...level, name: e.target.value })}
                  className="px-3 py-1 bg-gray-800 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </label>
            </div>
            <MapEditor level={level} onChange={setLevel} />
          </div>
        ) : gameState ? (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-3 space-y-4">
              <HeroStatus hero={gameState.hero} />
              
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-white font-bold mb-3">📊 实时统计</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">击杀怪物</span>
                    <span className="text-red-400 font-bold">{gameState.stats.monstersKilled}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">发现宝箱</span>
                    <span className="text-amber-400 font-bold">{gameState.stats.treasuresFound}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">触发陷阱</span>
                    <span className="text-orange-400 font-bold">{gameState.stats.trapsTriggered}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">行走步数</span>
                    <span className="text-blue-400 font-bold">{gameState.stats.steps}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-5">
              <GameBoard
                level={gameState.level}
                hero={gameState.hero}
                path={gameState.currentPath}
                currentStep={gameState.currentStep}
              />
            </div>

            <div className="col-span-4">
              <div className="h-[600px]">
                <BattleLogPanel logs={gameState.logs} />
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {gameState?.isFinished && gameState.result && (
        <GameResultModal
          result={gameState.result}
          onClose={handleBackToEditor}
          onRetry={handleRetry}
        />
      )}

      {showSaveModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">💾 保存关卡</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2">关卡名称</label>
                <input
                  type="text"
                  value={level.name}
                  onChange={(e) => setLevel({ ...level, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
              {levels.length > 0 && (
                <div>
                  <label className="block text-gray-400 mb-2">已保存的关卡</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {levels.map((l) => (
                      <div
                        key={l.id}
                        className="flex items-center justify-between p-2 bg-gray-700 rounded"
                      >
                        <span>{l.name}</span>
                        <button
                          onClick={() => handleLoadLevel(l)}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          加载
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveLevel}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
