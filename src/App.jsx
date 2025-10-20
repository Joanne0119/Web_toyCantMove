import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import EnterName from './pages/EnterName';
import ChooseChar from './pages/ChooseChar';
import WaitingRoom from './pages/WaitingRoom';
import ChooseLevel from './pages/ChooseLevel';
import ControllerTest from './pages/ControllerTest';
import Tutorial from './pages/Tutorial';
import Playing from './pages/Playing';
import Award from './pages/Award';
import Error from './pages/Error';
import Navbar from './components/Navbar';
import { useScreenWakeLock } from './hooks/useScreenWakeLock';


function App() {
  const { requestWakeLock, releaseWakeLock } = useScreenWakeLock((err) => {
    console.warn("Wake Lock Error:", err);
  });

  useEffect(() => {
    const enableWakeLockOnInteraction = async () => {
      try {
        await requestWakeLock();
        console.log('Wake Lock enabled');
      } catch (err) {
        console.error('Failed to enable Wake Lock:', err);
      }
    };

    // 監聽用戶的首次交互事件
    const handleUserInteraction = () => {
      enableWakeLockOnInteraction();
      // 移除事件監聽器，避免重複觸發
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };

    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('touchstart', handleUserInteraction);

    // 清理事件監聽器
    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
      releaseWakeLock();
    };
  }, [requestWakeLock, releaseWakeLock]);


  return (
    <GameProvider>
      <div className="flex flex-col h-screen"> {/* Full height container */}
        <Navbar />
        <div className="flex-1"> {/* Content area fills remaining space */}
          <Routes>
            <Route path="/" element={<EnterName />} />
            <Route path="/choose-char" element={<ChooseChar />} />
            <Route path="/waiting-room" element={<WaitingRoom />} />
            <Route path="/choose-level" element={<ChooseLevel />} />
            <Route path="/testing" element={<ControllerTest />} />
            <Route path="/tutorial" element={<Tutorial />} />
            <Route path="/playing" element={<Playing />} />
            <Route path="/award" element={<Award />} />
            <Route path="/error" element={<Error />} />
          </Routes>
        </div>
      </div>
    </GameProvider>
  );
}

export default App;