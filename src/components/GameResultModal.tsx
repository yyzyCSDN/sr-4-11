import React from 'react';
import { GameResult } from '../types/game';

interface GameResultModalProps {
  result: GameResult;
  onClose: () => void;
  onRetry: () => void;
}

export const GameResultModal: React.FC<GameResultModalProps> = ({ result, onClose, onRetry }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-700">
        <div className="text-center mb-6">
          {result.victory ? (
            <>
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-3xl font-bold text-yellow-400">胜利！</h2>
              <p className="text-gray-300 mt-2">勇者成功征服了地牢！</p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">💀</div>
              <h2 className="text-3xl font-bold text-red-400">失败...</h2>
              <p className="text-gray-300 mt-2">勇者在地牢中倒下了</p>
            </>
          )}
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
            <span className="text-gray-300 flex items-center gap-2">
              <span>💰</span> 获得金币
            </span>
            <span className="text-yellow-400 font-bold text-lg">{result.totalGold}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
            <span className="text-gray-300 flex items-center gap-2">
              <span>✨</span> 获得经验
            </span>
            <span className="text-purple-400 font-bold text-lg">{result.totalExp}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
            <span className="text-gray-300 flex items-center gap-2">
              <span>👾</span> 击杀怪物
            </span>
            <span className="text-red-400 font-bold text-lg">{result.monstersKilled}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
            <span className="text-gray-300 flex items-center gap-2">
              <span>📦</span> 发现宝箱
            </span>
            <span className="text-amber-400 font-bold text-lg">{result.treasuresFound}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
            <span className="text-gray-300 flex items-center gap-2">
              <span>⚠️</span> 触发陷阱
            </span>
            <span className="text-orange-400 font-bold text-lg">{result.trapsTriggered}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
            <span className="text-gray-300 flex items-center gap-2">
              <span>👣</span> 行走步数
            </span>
            <span className="text-blue-400 font-bold text-lg">{result.steps}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
            <span className="text-gray-300 flex items-center gap-2">
              <span>❤️</span> 剩余生命
            </span>
            <span className="text-green-400 font-bold text-lg">
              {result.heroFinalHp} / {result.heroMaxHp}
            </span>
          </div>
        </div>

        {!result.victory && (
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-6">
            <h3 className="text-blue-400 font-bold mb-2">💡 改进建议</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              {result.trapsTriggered > 2 && (
                <li>• 陷阱过多，考虑减少或分散布置</li>
              )}
              {result.monstersKilled === 0 && result.steps > 0 && (
                <li>• 可以增加一些怪物增加挑战性</li>
              )}
              {result.heroFinalHp === 0 && result.monstersKilled > 0 && (
                <li>• 怪物太强了，考虑削弱或减少数量</li>
              )}
              {result.steps < 5 && result.victory && (
                <li>• 地牢太简单，路径太短</li>
              )}
            </ul>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onRetry}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors"
          >
            🔄 再次挑战
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg transition-colors"
          >
            ✏️ 返回编辑
          </button>
        </div>
      </div>
    </div>
  );
};
