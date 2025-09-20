import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

const mockPlayers = [
  { name: '黃小姿', avatar: '/images/green.png' },
  { name: '爆香怪人', avatar: '/images/red.png' },
  { name: '柳橙恩', avatar: '/images/yellow.png' },
];

const WaitingRoom = () => {
  const { nickname, character, players, setPlayers } = useGame();
  const navigate = useNavigate();

  // For now, we'll treat the first player as the host.
  const isHost = players.length > 0 && players[0].name === nickname;

  useEffect(() => {
    // Add the current player to the list
    if (nickname && character) {
      setPlayers([{ name: nickname, avatar: character.src }, ...mockPlayers]);
    } else {
      // If there's no player info, go back to the start
      navigate('/');
    }
  }, [nickname, character, setPlayers, navigate]);

  const handleNext = () => {
    navigate('/choose-level');
  };

  const handleLeave = () => {
    // Clear context and go back to home
    // (This would be more robust with a proper state reset)
    navigate('/');
  };

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold">不會動的玩具<br/>才正常吧</h1>
          <div className="card bg-base-100 shadow-xl mt-8">
            <div className="card-body">
              <h2 className="card-title">等待玩家進入...</h2>
              <div className="space-y-3 mt-4">
                {players.map((player, index) => (
                  <div key={index} className="flex items-center bg-base-200 p-2 rounded-lg">
                    <div className="avatar mr-4">
                      <div className="w-12 rounded-full">
                        <img src={player.avatar} alt={player.name} />
                      </div>
                    </div>
                    <span className="text-lg">{player.name}</span>
                  </div>
                ))}
              </div>
              <div className="card-actions justify-center mt-6">
                <div className="flex flex-col space-y-2 w-full">
                  {isHost ? (
                    <button onClick={handleNext} className="btn btn-primary">
                      下一步
                    </button>
                  ) : (
                    <p className='text-center'>等待房主開始遊戲...</p>
                  )}
                  <button onClick={handleLeave} className="btn btn-ghost">
                    離開房間
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;