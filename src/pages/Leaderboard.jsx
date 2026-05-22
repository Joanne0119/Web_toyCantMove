import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
      <div className="hero-content text-center w-full max-w-lg z-10">
        <motion.div
          className="card bg-base-100 shadow-xl w-full"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 15 }}
        >
          <div className="card-body p-4 max-h-[80dvh] flex flex-col">
            <h2 className="card-title justify-center text-lg shrink-0">排行榜</h2>

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
                <table className="table w-full">
                  <thead>
                    <tr className="text-center">
                      <th className="bg-base-200/50 w-12">#</th>
                      <th className="bg-base-200/50">玩家</th>
                      <th className="bg-base-200/50 w-16">分數</th>
                      <th className="bg-base-200/50 w-24">日期</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r, i) => (
                      <tr key={i} className="text-center hover">
                        <th className="text-base-content/60">
                          {i < 3 ? ['\u{1F947}', '\u{1F948}', '\u{1F949}'][i] : i + 1}
                        </th>
                        <td>
                          <div className="flex items-center justify-center gap-2">
                            <div className="avatar">
                              <div className="w-8 rounded-full">
                                <LazyImage
                                  src={`/images/${r.color}_${r.skin}.png`}
                                  alt={r.name}
                                />
                              </div>
                            </div>
                            <span>{r.name}</span>
                          </div>
                        </td>
                        <td className="font-mono text-lg">{r.score}</td>
                        <td className="text-xs text-base-content/50">{r.date}</td>
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
