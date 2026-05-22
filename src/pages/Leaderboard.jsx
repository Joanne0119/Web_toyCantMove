import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Minimize2, RefreshCw } from 'lucide-react';
import LazyImage from '@/components/LazyImage';

const FIREBASE_URL = import.meta.env.VITE_FIREBASE_DB_URL;

const LEVEL_TABS = [
  { key: '4_TapEat', label: '瘋狂餐桌' },
  { key: '4_Toybox', label: '玩具紙箱' },
  { key: '4_ColorPaper', label: '塗鴉畫紙' },
  { key: '4_SpyGame', label: '數學作業' },
];

const Leaderboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(LEVEL_TABS[0].key);
  const [records, setRecords] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchRecords = useCallback(async (levelKey) => {
    setLoading(true);
    try {
      const res = await fetch(`${FIREBASE_URL}/leaderboard/${levelKey}.json`);
      const data = await res.json();
      if (data) {
        const list = Object.values(data);
        list.sort((a, b) => b.score - a.score);
        setRecords(list);
      } else {
        setRecords([]);
      }
    } catch (err) {
      console.warn('Failed to fetch leaderboard:', err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords(activeTab);
    // 每 60 秒自動刷新
    const interval = setInterval(() => fetchRecords(activeTab), 60000);
    return () => clearInterval(interval);
  }, [activeTab, fetchRecords]);

  return (
    <div
      className="hero min-h-screen bg-base-200 safe-area-bottom overflow-x-hidden select-none"
      style={{
        backgroundImage: "url('/images/coverLarge.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'left 47% center',
        minHeight: '100dvh',
      }}
    >
      <div className="absolute top-0 left-0 w-full h-full" style={{ backdropFilter: 'blur(1px) saturate(80%)' }} />
      <div className={`z-10 ${isFullscreen ? 'fixed inset-0' : 'hero-content text-center w-full max-w-lg'}`}>
        <motion.div
          className={`card bg-base-100 shadow-xl w-full ${isFullscreen ? 'h-full rounded-none' : ''}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 15 }}
          layout
        >
          <div className={`card-body p-4 flex flex-col ${isFullscreen ? 'h-full' : 'max-h-[80dvh]'}`}>
            <div className="flex items-center justify-between shrink-0">
              <button
                onClick={() => fetchRecords(activeTab)}
                className="btn btn-ghost btn-sm btn-circle"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <h2 className={`card-title justify-center ${isFullscreen ? 'text-2xl' : 'text-lg'}`}>排行榜</h2>
              <button
                onClick={() => setIsFullscreen(prev => !prev)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>

            {/* 關卡分頁 */}
            <div className="tabs tabs-boxed bg-base-200 justify-center shrink-0">
              {LEVEL_TABS.map(tab => (
                <button
                  key={tab.key}
                  className={`tab tab-sm ${activeTab === tab.key ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 排行榜列表 */}
            {loading ? (
              <div className="py-8 flex justify-center">
                <span className="loading loading-spinner loading-md"></span>
              </div>
            ) : records.length === 0 ? (
              <div className="py-8 text-base-content/50">
                <p>尚無紀錄</p>
              </div>
            ) : (
              <div className="overflow-auto w-full mt-2 flex-1">
                <table className={`table w-full ${isFullscreen ? 'table-lg' : ''}`}>
                  <thead>
                    <tr className="text-center">
                      <th className={`bg-base-200/50 w-12 ${isFullscreen ? 'text-lg' : ''}`}>#</th>
                      <th className={`bg-base-200/50 ${isFullscreen ? 'text-lg' : ''}`}>玩家</th>
                      <th className={`bg-base-200/50 w-16 ${isFullscreen ? 'text-lg' : ''}`}>分數</th>
                      <th className={`bg-base-200/50 w-24 ${isFullscreen ? 'text-lg' : ''}`}>日期</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r, i) => (
                      <tr key={i} className="text-center hover">
                        <th className={`text-base-content/60 ${isFullscreen ? 'text-lg' : ''}`}>
                          {i < 3 ? ['\u{1F947}', '\u{1F948}', '\u{1F949}'][i] : i + 1}
                        </th>
                        <td>
                          <div className="flex items-center justify-center gap-2">
                            <div className="avatar">
                              <div className={`${isFullscreen ? 'w-12' : 'w-8'} rounded-full`}>
                                <LazyImage
                                  src={`/images/${r.color}_${r.skin}.png`}
                                  alt={r.name}
                                />
                              </div>
                            </div>
                            <span className={isFullscreen ? 'text-lg' : ''}>{r.name}</span>
                          </div>
                        </td>
                        <td className={`font-mono ${isFullscreen ? 'text-xl' : 'text-lg'}`}>{r.score}</td>
                        <td className={`text-base-content/50 ${isFullscreen ? 'text-base' : 'text-xs'}`}>{r.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 底部按鈕 */}
            <div className="card-actions justify-center mt-2">
              <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm">
                返回
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Leaderboard;
