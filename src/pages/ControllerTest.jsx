import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGyroscope } from '../hooks/useGyroscope';

const ControllerTest = () => {
  const navigate = useNavigate();

  // Gyroscope State and Hooks
  const {
    direction,
    coordinates,
    isCalibrated,
    error: gyroscopeError,
    init: initGyroscope,
    calibrate: calibrateGyroscope,
    isSupported: isGyroscopeSupported,
  } = useGyroscope({
    movementThreshold: 20,
    calibrationTime: 1000,
    smoothingFactor: 0.3,
    deadZone: 5,
    maxThreshold: 60,
    enableAudio: false,
    enableVibration: false,
    debugMode: true,
    autoCalibrate: false,
  });

  const handleInitGyroscope = useCallback(async () => {
    if (!isGyroscopeSupported()) {
      alert('您的設備不支援陀螺儀，或未提供完整的感應器數據。');
      return;
    }
    await initGyroscope();
  }, [initGyroscope, isGyroscopeSupported]);

  const handleCalibrateGyroscope = useCallback(async () => {
    await calibrateGyroscope();
  }, [calibrateGyroscope]);

  const handleStartGame = () => {
    navigate('/playing');
  };

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">控制器測試</h1>
          <p className="py-6">測試陀螺儀</p>

          {/* Gyroscope Section */}
          <div className="card bg-base-100 shadow-xl mt-8 mb-4">
            <div className="card-body items-center text-center">
              <h2 className="card-title">陀螺儀控制</h2>
              {gyroscopeError && <div className="alert alert-error">錯誤: {gyroscopeError.msg}</div>}
              {!isGyroscopeSupported() && <div className="alert alert-warning">您的設備可能不支援陀螺儀。</div>}
              <div className="flex gap-2 mt-4">
                <button onClick={handleInitGyroscope} className="btn btn-primary" disabled={!isGyroscopeSupported()}>
                  {isGyroscopeSupported() ? '啟用感測器' : '不支援'}
                </button>
                <button onClick={handleCalibrateGyroscope} className="btn btn-secondary" disabled={!isGyroscopeSupported() || !isCalibrated}>
                  {isCalibrated ? '重新校正' : '校正'}
                </button>
              </div>
              <p className="mt-4">目前座標: <span className="font-bold">({coordinates.x.toFixed(2)}, {coordinates.y.toFixed(2)})</span></p>
              <p>目前方向: <span className="font-bold">{direction}</span></p>
              <p>校正狀態: <span className="font-bold">{isCalibrated ? '已校正' : '未校正'}</span></p>
            </div>
          </div>

          <div className="card-actions justify-center mt-8">
            <button onClick={handleStartGame} className="btn btn-primary">
              準備開始
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControllerTest;