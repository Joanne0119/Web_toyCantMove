import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

const EnterName = () => {
  const [name, setName] = useState('');
  const { setNickname } = useGame();
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (name.trim()) {
      setNickname(name.trim());
      navigate('/choose-char');
    } else {
      alert('Please enter a nickname');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" data-theme="dark">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">不會動的玩具<br/>才正常吧</h1>
      </div>
      <div className="card w-full max-w-sm shadow-xl bg-base-200">
        <div className="card-body">
          <div className="form-control">
            <label className="label">
              <span className="label-text">請輸入您的暱稱</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="某某某"
              className="input input-bordered mt-3"
            />
          </div>
          <div className="form-control mt-6">
            <button onClick={handleSubmit} className="btn btn-primary">
              確定
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterName;
