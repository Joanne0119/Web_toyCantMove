import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { motion, AnimatePresence } from "framer-motion";
import PodiumBar from '@/components/PodiumBar.jsx';

// const MOCK_FINAL_RESULTS = [
//   { name: '黃小姿', point: 128, rank: 1, color: 'green', skin: 'wind-up' },
//   { name: '爆香怪人', point: 96, rank: 2, color: 'red', skin: 'hat' },
//   { name: '柳橙恩', point: 73, rank: 3, color: 'yellow', skin: 'dog' },
//   { name: '青銅王', point: 0, rank: 4, color: 'blue', skin: 'deer' },
// ];
// const MOCK_LOCAL_PLAYER = { color: 'green', avatar: 'wind-up' };
// const MOCK_TERMINATE_IMAGE = 'https://picsum.photos/800/600';


const Award = () => {
  // const finalResults = MOCK_FINAL_RESULTS;
  // const localPlayer = MOCK_LOCAL_PLAYER;
  // const terminateImageLink = MOCK_TERMINATE_IMAGE;
  const { finalResults, localPlayer, terminateImageLink } = useGame();

  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [postcardDataUrl, setPostcardDataUrl] = useState(null);
  const [showPostcardModal, setShowPostcardModal] = useState(false);

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
  const CHARACTER_POSITIONS = [
    { x: 0.21, y: 0.12, size: 0.17, angle: -10 },  // 左上
    { x: 0.41, y: 0.03, size: 0.16, angle: 8 },    // 上方
    { x: 0.77, y: 0.38, size: 0.18, angle: 12 },   // 右側
    { x: 0.58, y: 0.70, size: 0.17, angle: -6 },   // 下方
  ];

  // 產生明信片 data URL
  const generatePostcard = useCallback(async () => {
    if (!terminateImageLink) return null;

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

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (frameBottomImg) {
      canvas.width = frameBottomImg.width;
      canvas.height = frameBottomImg.height;
    } else {
      canvas.width = 1200;
      canvas.height = 900;
    }

    const W = canvas.width;
    const H = canvas.height;

    // 底層外框
    if (frameBottomImg) {
      ctx.drawImage(frameBottomImg, 0, 0, W, H);
    } else {
      ctx.fillStyle = '#faf3e8';
      ctx.fillRect(0, 0, W, H);
    }

    // Unity 截圖（中央，旋轉）
    ctx.save();
    const shotW = W * 0.62;
    const shotH = H * 0.55;
    const shotX = W * 0.44;
    const shotY = H * 0.54;
    const shotAngle = -11 * (Math.PI / 180);
    ctx.translate(shotX, shotY);
    ctx.rotate(shotAngle);
    ctx.drawImage(screenshotImg, -shotW / 2, -shotH / 2, shotW, shotH);
    ctx.restore();

    // 上層外框
    if (frameTopImg) {
      ctx.drawImage(frameTopImg, 0, 0, W, H);
    }

    // 角色圖片
    const validChars = charImgs.filter(Boolean);
    validChars.forEach((charImg, i) => {
      if (i >= CHARACTER_POSITIONS.length) return;
      const pos = CHARACTER_POSITIONS[i];
      const charSize = W * pos.size;
      const ratio = charImg.width / charImg.height;
      const drawW = charSize * ratio;
      const drawH = charSize;
      const cx = W * pos.x + drawW / 2;
      const cy = H * pos.y + drawH / 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((pos.angle || 0) * (Math.PI / 180));
      ctx.drawImage(charImg, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    });

    // 日期文字
    const today = new Date();
    const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
    const fontSize = Math.round(W * 0.022);
    ctx.font = `${fontSize}px sans-serif`;
    ctx.fillStyle = '#5a5a5a';
    ctx.textAlign = 'right';
    ctx.fillText(dateStr, W * 0.92, H * 0.95);

    return canvas.toDataURL('image/png');
  }, [terminateImageLink, finalResults, loadImage]);

  // 收到 terminateImageLink 時自動產生明信片預覽
  useEffect(() => {
    if (!terminateImageLink) return;
    setIsGenerating(true);
    generatePostcard()
      .then(dataUrl => {
        if (dataUrl) {
          setPostcardDataUrl(dataUrl);
          setShowPostcardModal(true);
        }
      })
      .catch(err => console.error('Postcard generation failed:', err))
      .finally(() => setIsGenerating(false));
  }, [terminateImageLink, generatePostcard]);

  // 下載明信片
  const handleDownloadPostcard = useCallback(() => {
    if (!postcardDataUrl) return;
    const today = new Date();
    const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
    const a = document.createElement('a');
    a.download = `postcard-${dateStr.replace(/\./g, '')}.png`;
    a.href = postcardDataUrl;
    a.click();
  }, [postcardDataUrl]);

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
                    onClick={() => setShowPostcardModal(true)}
                    disabled={isGenerating || !postcardDataUrl}
                    className="btn btn-primary"
                  >
                    {isGenerating ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        產生中...
                      </>
                    ) : (
                      '查看明信片'
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      {/* 明信片預覽彈窗 */}
      <AnimatePresence>
        {showPostcardModal && postcardDataUrl && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPostcardModal(false)}
          >
            <motion.div
              className="relative bg-base-100 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header: 下載 icon + 關閉 */}
              <div className="flex items-center justify-between px-4 py-2">
                <button
                  onClick={handleDownloadPostcard}
                  className="btn btn-sm btn-circle btn-ghost"
                  title="下載明信片"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </button>
                <button
                  className="btn btn-circle btn-ghost text-xl"
                  onClick={() => setShowPostcardModal(false)}
                >
                  ✕
                </button>
              </div>

              {/* 明信片預覽圖 */}
              <div className="px-4 pb-4">
                <img
                  src={postcardDataUrl}
                  alt="明信片預覽"
                  className="w-full rounded-lg"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Award;