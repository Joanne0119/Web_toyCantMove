import { useState, useEffect, useRef, useCallback } from 'react';

export const useScreenWakeLock = (onError = () => {}) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const wakeLockSentinel = useRef(null); // Use ref to store the sentinel

  useEffect(() => {
    setIsSupported('wakeLock' in navigator);
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (!isSupported || document.hidden) { // Don't request if not supported or hidden
        console.log("Wake Lock not supported or document hidden.");
        return false; 
    }
    // Don't request if already active
    if (wakeLockSentinel.current !== null) {
        console.log("Wake Lock already active.");
        return true; 
    }

    try {
      wakeLockSentinel.current = await navigator.wakeLock.request('screen');
      setIsActive(true);
      console.log('Screen Wake Lock requested successfully!');

      // Listen for release events
      wakeLockSentinel.current.addEventListener('release', () => {
        console.log('Screen Wake Lock was released');
        setIsActive(false);
        wakeLockSentinel.current = null; // Clear the ref when released
      });
      return true;

    } catch (err) {
      console.error(`${err.name}, ${err.message}`);
      onError(err); // Call the provided error handler
      setIsActive(false);
      wakeLockSentinel.current = null;
      return false;
    }
  }, [isSupported, onError]);

  const releaseWakeLock = useCallback(async () => {
    if (!wakeLockSentinel.current) {
        return; // Nothing to release
    }
    try {
      await wakeLockSentinel.current.release();
      // The 'release' event listener above will handle setting state
      console.log('Screen Wake Lock released manually.');
    } catch (err) {
      console.error(`Failed to release Wake Lock: ${err.name}, ${err.message}`);
      onError(err);
    }
  }, [onError]);

  // Handle visibility changes (re-acquire lock if page becomes visible again)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (wakeLockSentinel.current !== null && document.visibilityState === 'visible') {
        console.log("Page became visible, re-requesting wake lock...");
        // Automatically try to re-acquire the lock
        requestWakeLock();
      } else if (document.visibilityState === 'hidden') {
          // No need to explicitly release, browser handles it, but good to know
          console.log("Page became hidden, wake lock will be released by browser.");
      }
    };

    if (isSupported) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      // Clean up listener on unmount
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [isSupported, requestWakeLock]);

  // Clean up wake lock on component unmount
  useEffect(() => {
    return () => {
      releaseWakeLock(); // Attempt to release on unmount
    };
  }, [releaseWakeLock]);


  return { isSupported, isActive, requestWakeLock, releaseWakeLock };
};