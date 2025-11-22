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
        textColor: 'text-white', // 深色背景配白字
        badgeColor: 'bg-yellow-700'
    };
    default:
    return {
        barColor: 'bg-base-300',
        textColor: 'text-base-content',
        badgeColor: 'bg-base-300'
    };
}
};

const PodiumBar = (player, maxScore) => {
    if (!player) return <div className="w-24 mx-2"></div>; // 佔位符

    const style = getRankStyle(player.rank);
    // 計算高度：(分數 / 最高分) * 100%，再加上一個基礎高度避免 0 分太扁
    // 這裡設定最大高度為 10rem (h-40)
    const heightPercent = maxScore > 0 ? (player.score / maxScore) : 0;
    const barHeight = `${Math.max(2, heightPercent * 10)}rem`; 

    return (
      <div className="flex flex-col items-center justify-end mx-1 sm:mx-2 w-20 sm:w-24">
        <div className="avatar mb-2">
          <div className={`w-14 sm:w-16 rounded-full`}>
            <img src={player.avatar} alt={player.name} />
          </div>
        </div>
        <div className="font-bold text-sm sm:text-base mb-1 truncate w-full text-center">{player.name}</div>
        <motion.div 
          className={`w-full rounded-t-lg flex items-center justify-center ${style.barColor} ${style.textColor} shadow-lg`}
          style={{ height: barHeight }}
          initial={{ height: 0 }}
          animate={{ height: barHeight }}
          transition={{ duration: 1, type: "spring" }}
        >
          <span className="text-xl font-bold">{player.rank}</span>
        </motion.div>
      </div>
    );
  };

export default PodiumBar
