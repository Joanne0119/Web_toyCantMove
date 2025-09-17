import { BrowserRouter, Routes, Route } from 'react-router'
import EnterName from '@/pages/EnterName';
import ChooseChar from '@/pages/ChooseChar';
import WaitingRoom from '@/pages/WaitingRoom';
import WaitingRoomHost from '@/pages/WaitingRoomHost';
import ChooseLevel from '@/pages/ChooseLevel';
import ChooseLevelHost from '@/pages/ChooseLevelHost';
import Testing from '@/pages/Testing';
import Award from '@/pages/Award';
import Connect from '@/pages/Connect';
import ConnectSuccess from '@/pages/ConnectSuccess';  
import './App.css'

function App() {

  return (
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<EnterName />} />
              <Route path="/choose-char" element={<ChooseChar />} />
              <Route path="/waiting-room" element={<WaitingRoom />} />
              <Route path="/waiting-room-host" element={<WaitingRoomHost />} />
              <Route path="/choose-level" element={<ChooseLevel />} />
              <Route path="/choose-level-host" element={<ChooseLevelHost />} />
              <Route path="/testing" element={<Testing />} />
              <Route path="/award" element={<Award />} />
              <Route path="/connect" element={<Connect />} />
              <Route path="/connect-success" element={<ConnectSuccess />} />
          </Routes>
      </BrowserRouter>
    );
}

export default App
