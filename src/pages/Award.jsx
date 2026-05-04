import React, { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { motion } from "framer-motion";
import PodiumBar from '@/components/PodiumBar.jsx';

// const MOCK_FINAL_RESULTS = [
//   { name: '黃小姿', point: 128, rank: 1, color: 'green', skin: 'wind-up' },
//   { name: '爆香怪人', point: 96, rank: 2, color: 'red', skin: 'hat' },
//   { name: '柳橙恩', point: 73, rank: 3, color: 'yellow', skin: 'dog' },
  // { name: '青銅王', point: 0, rank: 4, color: 'blue', skin: 'deer' },
// ];
// const MOCK_LOCAL_PLAYER = { color: 'green', avatar: 'wind-up' };


const Award = () => {
  // debug fake data
  // const finalResults = MOCK_FINAL_RESULTS;
  // const localPlayer = MOCK_LOCAL_PLAYER;

  const { finalResults, localPlayer, terminateImageLink } = useGame();

  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);

  // 載入單張圖片的 helper
  const loadImage = useCallback((src, crossOrigin = false) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      if (crossOrigin) img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  }, []);

  // 角色在明信片上的位置（依設計稿，以 canvas 百分比定位）
  // 順序：左上、上方偏右、右側、下方偏中
  const CHARACTER_POSITIONS = [
    { x: 0.08, y: 0.18, size: 0.16 },  // 左上
    { x: 0.42, y: 0.02, size: 0.15 },  // 上方
    { x: 0.78, y: 0.38, size: 0.18 },  // 右側
    { x: 0.45, y: 0.75, size: 0.16 },  // 下方
  ];

  // 下載明信片
  const handleDownloadPostcard = useCallback(async () => {
    if (!terminateImageLink) return;
    setIsDownloading(true);

    try {
      // 1. 載入所有圖片
      const screenshotPromise = loadImage(terminateImageLink, true);
      const frameBottomPromise = loadImage('/images/postcard_frame.png').catch(() => null);
      const frameTopPromise = loadImage('/images/postcard_frame_top.png').catch(() => null);
      const characterPromises = (finalResults || []).map(r =>
        loadImage(`/images/${r.color}_${r.skin}.png`).catch(() => null)
      );

      const [screenshotImg, frameBottomImg, frameTopImg, ...charImgs] = await Promise.all([
        screenshotPromise,
        frameBottomPromise,
        frameTopPromise,
        ...characterPromises,
      ]);

      // 2. 建立 canvas，尺寸以外框為主
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (frameBottomImg) {
        canvas.width = frameBottomImg.width;
        canvas.height = frameBottomImg.height;
      } else {
        // fallback: 4:3 明信片比例
        canvas.width = 1200;
        canvas.height = 900;
      }

      const W = canvas.width;
      const H = canvas.height;

      // 3a. 繪製外框底層
      if (frameBottomImg) {
        ctx.drawImage(frameBottomImg, 0, 0, W, H);
      } else {
        ctx.fillStyle = '#faf3e8';
        ctx.fillRect(0, 0, W, H);
      }

      // 3b. 繪製 Unity 截圖在中央筆記本區域，微微旋轉
      ctx.save();
      const shotW = W * 0.55;
      const shotH = H * 0.50;
      const shotX = W * 0.48;  // 中心 X（略偏左）
      const shotY = H * 0.50;  // 中心 Y
      const shotAngle = -11 * (Math.PI / 180); // 逆時針旋轉 11 度

      ctx.translate(shotX, shotY);
      ctx.rotate(shotAngle);
      ctx.drawImage(screenshotImg, -shotW / 2, -shotH / 2, shotW, shotH);
      ctx.restore();

      // 3c. 繪製外框上層（膠帶、裝飾等蓋住截圖邊緣）
      if (frameTopImg) {
        ctx.drawImage(frameTopImg, 0, 0, W, H);
      }

      // 3d. 繪製角色圖片（散佈在四周）
      const validChars = charImgs.filter(Boolean);
      validChars.forEach((charImg, i) => {
        if (i >= CHARACTER_POSITIONS.length) return;
        const pos = CHARACTER_POSITIONS[i];
        const charSize = W * pos.size;
        const ratio = charImg.width / charImg.height;
        const drawW = charSize * ratio;
        const drawH = charSize;
        const drawX = W * pos.x;
        const drawY = H * pos.y;
        ctx.drawImage(charImg, drawX, drawY, drawW, drawH);
      });

      // 3e. 繪製日期文字（右下角，設計稿風格）
      const today = new Date();
      const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
      const fontSize = Math.round(W * 0.03);
      ctx.font = `${fontSize}px sans-serif`;
      ctx.fillStyle = '#5a5a5a';
      ctx.textAlign = 'right';
      ctx.fillText(dateStr, W * 0.95, H * 0.95);

      // 4. 觸發下載
      const a = document.createElement('a');
      a.download = `postcard-${dateStr.replace(/\./g, '')}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    } catch (err) {
      console.error('Postcard download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  }, [terminateImageLink, finalResults, loadImage]);

  const results = useMemo(() => {
    if (!finalResults || finalResults.length === 0) {
      return []; 
    }

    return finalResults.map(r => {
      const name = `${r.name}`; 
      const avatar = `/images/${r.color}_${r.skin}.png`; 

      return {
        name,
        score: r.point,
        rank: r.rank, 
        avatar,
        color: r.color,
        skin: r.skin
      };
    });
  }, [finalResults]); 

  // 計算最高分，用於計算高度百分比
  const maxScore = useMemo(() => {
    if (results.length === 0) return 100;
    return Math.max(...results.map(r => r.score));
  }, [results]);

  // 取前四名顯示在頒獎台
  const top4 = results

  const handlePlayAgain = () => {
    navigate('/choose-level');
  };

  const handleLeave = () => {
    navigate('/');
  };

  const compact = top4.length > 3;

  return (
    <div className="hero min-h-screen bg-base-200 safe-area-bottom overflow-x-hidden select-none" style={{ backgroundImage: "url('/images/coverLarge.png')", backgroundSize: 'cover', backgroundPosition: 'left 47% center', minHeight: '100dvh'}}>
      <div className='absolute top-0 left-0 w-full h-full' style={{ backdropFilter: 'blur(1px) saturate(80%)' }}></div>
        <div className="hero-content text-center">
        <div className="max-w-lg">
          <motion.div 
            className="card bg-base-100 shadow-xl"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",   
              stiffness: 120,   
              damping: 15,      
              duration: 0.8
            }}
          >
            <div className="card-body p-4 sm:p-8">
              <div className="flex justify-center items-end h-50 mb-8 pb-2 border-b border-base-300">
                {/** if there are 4 players use compact mode to avoid overflow */}
                
                <PodiumBar player={top4[1]} maxScore={maxScore} compact={compact}/>
                
                <div className="z-10 sm:mx-0 scale-110 origin-bottom">
                   <PodiumBar player={top4[0]} maxScore={maxScore} compact={compact} />
                </div>

                <PodiumBar player={top4[2]} maxScore={maxScore} compact={compact} />
                <div className="z-10 sm:mx-0 scale-110 origin-bottom">
                {top4.length > 3 ? <PodiumBar player={top4[3]} maxScore={maxScore} compact={compact} /> : null}
                </div>
              </div>

              <div className="overflow-x-auto w-full">
                <table className="table w-full">
                  <thead>
                    <tr className="text-center">
                      <th className="bg-base-200/50">名次</th>
                      <th className="bg-base-200/50">玩家</th>
                      <th className="bg-base-200/50">分數</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr 
                        key={i} 
                        className={`text-center hover ${
                          r.color === localPlayer.color && r.skin === localPlayer.avatar 
                          ? 'bg-primary/20 font-bold' 
                          : ''
                        }`}
                      >
                        <th>
                          {r.rank}
                        </th>
                        <td>
                          <div className="flex items-center justify-center gap-2">
                            <div className="avatar">
                              <div className="w-8 rounded-full">
                                <img src={r.avatar} alt={r.name} />
                              </div>
                            </div>
                            {r.name}
                          </div>
                        </td>
                        <td className="font-mono text-lg">{r.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {terminateImageLink && (
                <div className="card-actions justify-center mt-6">
                  <button
                    onClick={handleDownloadPostcard}
                    disabled={isDownloading}
                    className="btn btn-primary"
                  >
                    {isDownloading ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        處理中...
                      </>
                    ) : (
                      '下載明信片'
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Award;