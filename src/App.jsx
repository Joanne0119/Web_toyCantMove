import { Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import EnterName from './pages/EnterName';
import ChooseChar from './pages/ChooseChar';
import WaitingRoom from './pages/WaitingRoom';
import ChooseLevel from './pages/ChooseLevel';
import ControllerTest from './pages/ControllerTest';
import Playing from './pages/Playing';
import Award from './pages/Award';
import Error from './pages/Error';
import Navbar from './components/Navbar';

function App() {
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