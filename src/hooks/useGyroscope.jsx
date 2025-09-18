import { useState, useEffect, useCallback, useRef } from 'react';
import { GyroscopeManager } from '../lib/gyroscopeManager.js';

export const useGyroscope = (config) => {
  const managerRef = useRef(null);
  const [direction, setDirection] = useState('靜止');
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Place the GyroscopeManager class code into src/lib/gyroscopeManager.js
    if (!managerRef.current) {
      managerRef.current = new GyroscopeManager(config);
    }

    const manager = managerRef.current;

    manager.on('directionChange', (newDirection) => {
      setDirection(newDirection);
    });

    manager.on('coordinateChange', (newCoords) => {
      setCoordinates(newCoords);
    });

    manager.on('calibrationComplete', () => {
      setIsCalibrated(true);
    });

    manager.on('error', (errMsg, errObj) => {
      setError({ msg: errMsg, obj: errObj });
    });

    // Cleanup on unmount
    return () => {
      manager.destroy();
    };
  }, [config]);

  const init = useCallback(async () => {
    if (managerRef.current) {
      try {
        const success = await managerRef.current.init();
        if (!success) {
          setError({ msg: 'Gyroscope initialization failed.' });
        }
        return success;
      } catch (e) {
        setError({ msg: 'Permission to use sensors was denied.', obj: e });
        return false;
      }
    }
    return false;
  }, []);

  const calibrate = useCallback(async () => {
    if (managerRef.current) {
      setIsCalibrated(false); // Reset calibration state
      await managerRef.current.calibrate();
    }
  }, []);

  return { 
    direction, 
    coordinates, 
    isCalibrated, 
    error, 
    init, 
    calibrate, 
    isSupported: () => managerRef.current ? managerRef.current.isPlatformSupported() : false
  };
};
