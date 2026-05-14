import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { WebRTCManager } from '../lib/webRTCManager.js';

export const useWebRTC = (localPeerId, stunServerAddress, uiConfig) => {
  const managerRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [webRTCConnections, setWebRTCConnections] = useState([]); // List of connected peer IDs
  const [dataChannelConnections, setDataChannelConnections] = useState([]); // List of peer IDs with open data channels
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  const [peers, setPeers] = useState([]);

  useEffect(() => {
    if (localPeerId) {
      setupManager();

      return () => {
        if (managerRef.current) {
          managerRef.current.closeWebRTC();
          managerRef.current.closeWebSocket();
          managerRef.current = null;
        }
      };
    }
  }, [localPeerId, setupManager]);

  const setupManager = useCallback(() => {
    if (managerRef.current) return managerRef.current;
    if (!localPeerId) return null;

    const manager = new WebRTCManager(localPeerId, stunServerAddress, uiConfig);

    manager.onWebSocketConnection = (state) => {
      setIsConnected(state === 'open');
      if (state === 'error' || state === 'closed') {
        setError({ type: 'websocket', message: `WebSocket connection ${state}` });
      }
    };
    manager.onWebRTCConnection = (peerId) => {
      setWebRTCConnections((prev) => prev.includes(peerId) ? prev : [...prev, peerId]);
    };
    manager.onDataChannelConnection = (peerId) => {
      setDataChannelConnections((prev) => prev.includes(peerId) ? prev : [...prev, peerId]);
    };
    manager.onDataChannelDisconnection = (peerId) => {
      setDataChannelConnections((prev) => prev.filter(id => id !== peerId));
    };
    manager.onDataChannelMessageReceived = (message, peerId) => {
      setLastMessage({ message, peerId, timestamp: Date.now() });
    };
    manager.onPeerListChange = (peerIds) => {
      setPeers(peerIds);
    };

    managerRef.current = manager;
    return manager;
  }, [localPeerId, stunServerAddress, uiConfig]);

  const connect = useCallback(async (webSocketUrl, isVideoAudioSender, isVideoAudioReceiver) => {
    const manager = setupManager();
    if (manager) {
      try {
        await manager.connect(webSocketUrl, isVideoAudioSender, isVideoAudioReceiver);
        return true;
      } catch (e) {
        setError({ type: 'connect', message: 'Failed to connect to WebSocket', obj: e });
        return false;
      }
    }
    return false;
  }, [setupManager]);

  const disconnect = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.closeWebRTC();
      managerRef.current.closeWebSocket();
      managerRef.current = null; // 銷毀 manager，下次 connect 時重建
      setIsConnected(false);
      setWebRTCConnections([]);
      setDataChannelConnections([]);
      setPeers([]);
      setLastMessage(null);
      setError(null);
    }
  }, []);

  const sendData = useCallback((message, targetPeerId = null) => {
    if (managerRef.current && isConnected) {
      managerRef.current.sendViaDataChannel(message, targetPeerId);
    } else {
      console.warn('Cannot send data: WebRTCManager not connected.');
    }
  }, [isConnected]);

  const setLocalStream = useCallback(async (stream) => {
    if (managerRef.current) {
      await managerRef.current.setLocalStream(stream);
    }
  }, []);

  const initiateOffersToAllPeers = useCallback(async () => {
    if (managerRef.current) {
      await managerRef.current.initiateOffersToAllPeers();
    }
  }, []);

  const memoizedValue = useMemo(() => {
    return {
      isConnected,
      webRTCConnections,
      dataChannelConnections,
      lastMessage,
      error,
      connect,
      disconnect,
      sendData,
      setLocalStream,
      initiateOffersToAllPeers,
      peers,
      manager: managerRef.current
    };
  }, [ 
    isConnected, webRTCConnections, dataChannelConnections, lastMessage,
    error, connect, disconnect, sendData, setLocalStream,
    initiateOffersToAllPeers, peers, managerRef.current
  ]);

  return memoizedValue; 
};
