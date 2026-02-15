import React from 'react'
import { motion } from "framer-motion";

// 定義排名樣式 (顏色)
const getRankStyle = (rank) => {
switch (rank) {
    case 1:
    return {
        barColor: 'bg-yellow-400',
        textColor: 'text-black',
        badgeColor: 'bg-yellow-400'
    };
    case 2:
    return {
        barColor: 'bg-gray-400',
        textColor: 'text-black',
        badgeColor: 'bg-gray-400'
    };
    case 3:
    return {
        barColor: 'bg-yellow-700',
        textColor: 'text-white', 
        badgeColor: 'bg-yellow-700'
    };
    case 4:
    return {
        barColor: 'bg-amber-700',
        textColor: 'text-white', 
        badgeColor: 'bg-amber-700'
    };
    default:
    return {
        barColor: 'bg-base-300',
        textColor: 'text-base-content',
        badgeColor: 'bg-base-300'
    };
}
};

const PodiumBar = ({player, maxScore, compact = false}) => {
    if (!player) return <div className={`${compact ? 'w-20 mx-1' : 'w-24 mx-2'} flex-shrink-0`}></div>; // 佔位符

    const style = getRankStyle(player.rank);
    // 計算高度：(分數 / 最高分) * 最大高度 (rem)，再加上一個基礎高度避免 0 分太扁
    const maxBarRem = compact ? 4.5 : 6; 
    const minBarRem = compact ? 1.0 : 1.5;
    const heightPercent = maxScore > 0 ? (player.score / maxScore) : 0;
    const barHeight = `${Math.max(minBarRem, heightPercent * maxBarRem)}rem`;

    const containerClass = compact ? 'w-14 sm:w-24 mx-1' : 'w-20 sm:w-28 mx-2';
    const avatarClass = compact ? 'w-12 sm:w-14' : 'w-14 sm:w-16';
    const nameClass = compact ? 'text-sm mb-1' : 'text-sm sm:text-base mb-1';
    const rankFontClass = compact ? 'text-md font-bold' : 'text-xl font-bold';

    return (
      <div className={`${containerClass} flex-shrink-0 flex flex-col items-center justify-end`}>
        <div className="avatar mb-2">
          <div className={`${avatarClass} rounded-full overflow-hidden`}>
            <img src={player.avatar} alt={player.name} />
          </div>
        </div>
        <div className={`font-bold ${nameClass} truncate w-full text-center`}>{player.name}</div>
        <motion.div 
          className={`w-full rounded-t-lg flex items-center justify-center ${style.barColor} ${style.textColor} shadow-lg`}
          style={{ height: barHeight }}
          initial={{ height: 0 }}
          animate={{ height: barHeight }}
          transition={{ duration: 1, type: "spring" }}
        >
          <span className={rankFontClass}>{player.rank}</span>
        </motion.div>
      </div>
    );
  };

export default PodiumBar
