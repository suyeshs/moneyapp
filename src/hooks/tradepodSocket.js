// tradepodSocket.js
import { useEffect, useRef, useState, useCallback } from 'react';
import { paytmSocketStore } from '../stores/PaytmSocketStore'; // This is a custom hook to use your MobX store

const TradepodSocket = (url) => {
  const store = paytmSocketStore; // Access your MobX store
  //const ws = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  // Function to send messages to the server
  const sendMessage = useCallback((message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  }, []);

  function toPlainObject(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    if (obj instanceof Date) {
      return new Date(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(toPlainObject);
    }
    if (typeof obj === 'object') {
      const plainObj = {};
      for (const key of Object.keys(obj)) {
        plainObj[key] = toPlainObject(obj[key]);
      }
      return plainObj;
    }
    return obj;
  }
  

  // Function to handle incoming WebSocket messages
// Function to handle incoming WebSocket messages
const handleMessage = useCallback((event) => {
  if (typeof event.data === 'string') {
    try {
      const newData = JSON.parse(event.data);
      const plainData = toPlainObject(newData); // Convert to plain object
      paytmSocketStore.setData(plainData);
    } catch (error) {
      console.error('Error parsing JSON message:', error);
    }
  } else {
    console.log('Binary message received and ignored.');
  }
}, []);





  
  
  

  // Function to establish WebSocket connection
  const connect = useCallback(() => {
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      console.log('WebSocket Connected');
      setIsConnected(true);
    };

    ws.current.onmessage = handleMessage;

    ws.current.onerror = (error) => {
      console.error('WebSocket Error: ', error);
    };

    ws.current.onclose = (e) => {
      console.log('WebSocket Disconnected', e.reason);
      setIsConnected(false);
      // Automatic reconnection logic
      if (!e.wasClean) {
        setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, 5000); // Attempt to reconnect every 5 seconds
      }
    };
  }, [url, handleMessage]);

  // Effect to establish connection on mount and clean up on unmount
  useEffect(() => {
    connect();

    return () => {
      if (ws.current) {
        ws.current.close(1000, 'Component unmounted');
      }
    };
  }, [connect]);

  return { isConnected, sendMessage };
};

export default tradepodSocket;
