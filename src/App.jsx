import { Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import EnterName from './pages/EnterName';
import ChooseChar from './pages/ChooseChar';
import WaitingRoom from './pages/WaitingRoom';
import ChooseLevel from './pages/ChooseLevel';
import ControllerTest from './pages/ControllerTest';
import Award from './pages/Award';

function App() {
  return (
    <GameProvider>
      <Routes>
        <Route path="/" element={<EnterName />} />
        <Route path="/choose-char" element={<ChooseChar />} />
        <Route path="/waiting-room" element={<WaitingRoom />} />
        <Route path="/choose-level" element={<ChooseLevel />} />
        <Route path="/testing" element={<ControllerTest />} />
        <Route path="/award" element={<Award />} />
      </Routes>
    </GameProvider>
  );
}

export default App;
