import React, { useEffect, useState } from 'react';

interface WebSocketComponentProps {
  symbol: string;
  expiry: string;
  onWebSocketUrl: (url: string) => void; // Callback function to receive WebSocket URL
}

const WebSocketComponent: React.FC<WebSocketComponentProps> = ({ symbol, expiry, onWebSocketUrl }) => {
  useEffect(() => {
    // Generate the WebSocket URL based on the symbol and expiry
    const wsUrl = `ws://127.0.0.1:8888/tradepod?symbol=${symbol}&expiryDate=${expiry}`;
    console.log('WebSocket URL:', wsUrl);

    // Pass the WebSocket URL to the callback function
    onWebSocketUrl(wsUrl);
  }, [symbol, expiry, onWebSocketUrl]);

  return null; // You can return any JSX you want to render or just null if you don't need to render anything
};

export default WebSocketComponent;
