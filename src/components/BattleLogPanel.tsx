import React, { useEffect, useRef } from 'react';
import { BattleLog } from '../types/game';

interface BattleLogPanelProps {
  logs: BattleLog[];
}

export const BattleLogPanel: React.FC<BattleLogPanelProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogColor = (type: BattleLog['type']): string => {
    switch (type) {
      case 'move': return 'text-gray-300';
      case 'battle': return 'text-red-400';
      case 'trap': return 'text-orange-400';
      case 'treasure': return 'text-yellow-400';
      case 'levelup': return 'text-purple-400';
      case 'death': return 'text-red-500 font-bold';
      case 'victory': return 'text-green-400 font-bold';
      default: return 'text-gray-300';
    }
  };

  const getLogIcon = (type: BattleLog['type']): string => {
    switch (type) {
      case 'move': return '👣';
      case 'battle': return '⚔️';
      case 'trap': return '💥';
      case 'treasure': return '✨';
      case 'levelup': return '⬆️';
      case 'death': return '💀';
      case 'victory': return '🎉';
      default: return '📝';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full flex flex-col">
      <h3 className="text-white font-bold mb-3 flex items-center gap-2">
        <span>📜</span> 战斗日志
      </h3>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
      >
        {logs.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">
            等待冒险开始...
          </p>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`text-sm flex items-start gap-2 ${getLogColor(log.type)}`}
            >
              <span className="flex-shrink-0">{getLogIcon(log.type)}</span>
              <span className="flex-1">{log.message}</span>
              {log.heroHp !== undefined && (
                <span className="text-xs text-gray-500 flex-shrink-0">
                  HP: {log.heroHp}/{log.heroMaxHp}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
