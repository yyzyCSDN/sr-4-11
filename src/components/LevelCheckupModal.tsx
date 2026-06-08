import React from 'react';
import { LevelCheckupResult, CheckItem, CheckSeverity } from '../utils/levelCheckup';

interface LevelCheckupModalProps {
  result: LevelCheckupResult;
  onClose: () => void;
  onForceStart: () => void;
}

const severityConfig: Record<CheckSeverity, { icon: string; borderColor: string; bgColor: string; textColor: string }> = {
  error: { icon: '❌', borderColor: 'border-red-500', bgColor: 'bg-red-900/30', textColor: 'text-red-400' },
  warning: { icon: '⚠️', borderColor: 'border-yellow-500', bgColor: 'bg-yellow-900/30', textColor: 'text-yellow-400' },
  success: { icon: '✅', borderColor: 'border-green-500', bgColor: 'bg-green-900/30', textColor: 'text-green-400' },
};

function CheckItemRow({ item }: { item: CheckItem }) {
  const config = severityConfig[item.severity];
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${config.borderColor} ${config.bgColor}`}>
      <span className="text-xl flex-shrink-0">{config.icon}</span>
      <div className="flex-1 min-w-0">
        <div className={`font-bold text-sm ${config.textColor}`}>{item.label}</div>
        <div className="text-gray-300 text-sm mt-0.5">{item.message}</div>
      </div>
    </div>
  );
}

export const LevelCheckupModal: React.FC<LevelCheckupModalProps> = ({ result, onClose, onForceStart }) => {
  const errorCount = result.items.filter(i => i.severity === 'error').length;
  const warningCount = result.items.filter(i => i.severity === 'warning').length;
  const successCount = result.items.filter(i => i.severity === 'success').length;

  const hasIssue = errorCount > 0 || warningCount > 0;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 max-w-lg w-full mx-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🏥</span>
          <h3 className="text-xl font-bold text-white">关卡体检报告</h3>
        </div>

        <div className="flex gap-3 mb-4">
          {errorCount > 0 && (
            <span className="px-3 py-1 bg-red-900/50 text-red-400 rounded-full text-sm font-bold">
              ❌ {errorCount} 项错误
            </span>
          )}
          {warningCount > 0 && (
            <span className="px-3 py-1 bg-yellow-900/50 text-yellow-400 rounded-full text-sm font-bold">
              ⚠️ {warningCount} 项警告
            </span>
          )}
          {successCount > 0 && (
            <span className="px-3 py-1 bg-green-900/50 text-green-400 rounded-full text-sm font-bold">
              ✅ {successCount} 项通过
            </span>
          )}
        </div>

        <div className="space-y-2 overflow-y-auto flex-1 mb-4 pr-1">
          {result.items.map(item => (
            <CheckItemRow key={item.key} item={item} />
          ))}
        </div>

        {hasIssue && (
          <div className="bg-gray-700/50 rounded-lg p-3 mb-4 text-sm text-gray-400">
            💡 建议：返回编辑器修正错误项后再次体检，确保关卡可正常游玩
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors font-medium"
          >
            ✏️ 返回编辑
          </button>
          {result.canForceStart && hasIssue && (
            <button
              onClick={onForceStart}
              className="flex-1 py-2.5 bg-yellow-600 hover:bg-yellow-500 rounded-lg font-bold transition-colors"
            >
              ⚡ 强制开始
            </button>
          )}
          {!hasIssue && (
            <button
              onClick={onForceStart}
              className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 rounded-lg font-bold transition-colors"
            >
              ▶️ 开始测试
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
