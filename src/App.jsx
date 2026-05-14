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
import Footer from './components/Footer';
import DisconnectModal from './components/DisconnectModal';
import OfficialSite from './pages/OfficialSite/OfficialSite';


function App() {
  return (
    <Routes>
      <Route path="/" element={<OfficialSite />} />
      <Route path="/*" element={
        <GameProvider>
          <div className="flex flex-col h-screen">
            <Navbar />
            <Footer />
            <DisconnectModal />
            <div className="flex-1">
              <Routes>
                <Route path="enter-name" element={<EnterName />} />
                <Route path="choose-char" element={<ChooseChar />} />
                <Route path="waiting-room" element={<WaitingRoom />} />
                <Route path="choose-level" element={<ChooseLevel />} />
                <Route path="testing" element={<ControllerTest />} />
                <Route path="tutorial" element={<Tutorial />} />
                <Route path="playing" element={<Playing />} />
                <Route path="award" element={<Award />} />
                <Route path="error" element={<Error />} />
              </Routes>
            </div>
          </div>
        </GameProvider>
      } />
    </Routes>
  );
}

export default App;