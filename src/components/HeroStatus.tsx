import React from 'react';
import { Hero } from '../types/game';
import { getExpRequired } from '../data/templates';

interface HeroStatusProps {
  hero: Hero;
}

export const HeroStatus: React.FC<HeroStatusProps> = ({ hero }) => {
  const hpPercent = (hero.hp / hero.maxHp) * 100;
  const expRequired = getExpRequired(hero.level);
  const expPercent = (hero.exp / expRequired) * 100;

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-4xl">{hero.emoji}</div>
        <div>
          <h3 className="text-white font-bold text-lg">{hero.name}</h3>
          <div className="text-yellow-400 text-sm">Lv.{hero.level}</div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-red-400">❤️ 生命值</span>
            <span className="text-white">{hero.hp} / {hero.maxHp}</span>
          </div>
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300"
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-purple-400">✨ 经验值</span>
            <span className="text-white">{hero.exp} / {expRequired}</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-300"
              style={{ width: `${expPercent}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-orange-400">⚔️</span>
            <span className="text-gray-300 text-sm">攻击</span>
            <span className="text-white font-bold ml-auto">{hero.attack}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-400">🛡️</span>
            <span className="text-gray-300 text-sm">防御</span>
            <span className="text-white font-bold ml-auto">{hero.defense}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">💰</span>
            <span className="text-gray-300 text-sm">金币</span>
            <span className="text-yellow-300 font-bold ml-auto">{hero.gold}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">📍</span>
            <span className="text-gray-300 text-sm">位置</span>
            <span className="text-white font-bold ml-auto">({hero.position.x}, {hero.position.y})</span>
          </div>
        </div>

        {hero.items.length > 0 && (
          <div className="pt-4 border-t border-gray-700">
            <div className="text-sm text-gray-400 mb-2">🎒 背包</div>
            <div className="flex flex-wrap gap-2">
              {hero.items.map((item, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
