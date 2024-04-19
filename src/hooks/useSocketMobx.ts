import { useEffect, useRef, useState, useCallback } from 'react';
import { paytmSocketStore } from '../stores/PaytmSocketStore';
import { OptionData } from '../types';
import { autorun } from "mobx";

export const useWebSocketMobX = () => {
  console.log("useWebSocketMobX called");

  const [isInitialLoadCompleted, setInitialLoadCompleted] = useState(false);
  const socket = useRef<WebSocket | null>(null);
  const accumulatedData = useRef<OptionData[]>([]);
  const url = process.env.NEXT_PUBLIC_WEBSOCKET_PROD || "ws://127.0.0.1:8888/tradepod";
  
  // Track whether a response has been received
  const responseReceived = useRef(false);

  const connectWebSocket = useCallback(() => {
    // Close existing socket connection if any
    if (socket.current) {
      socket.current.close();
    }

    // Establish new WebSocket connection
    socket.current = new WebSocket(url);

    const handleOpen = () => {
      sendSymbolAndExpiry();
    };

    const handleMessage = (event: MessageEvent) => {
      const dataObject: OptionData = JSON.parse(event.data);
      console.log("Received data:", dataObject);
      
      const lastStrike = dataObject.lastStrike;
      console.log("lastStrike", lastStrike);
      
      const existingIndex = accumulatedData.current.findIndex((item) => item.strikePrice === dataObject.strikePrice);
      const UnderlyingValue = dataObject.underlyingValue;
      console.log("UnderlyingValue", UnderlyingValue); 
      
      if (existingIndex === -1) {
        accumulatedData.current.push(dataObject);
      } else {
        accumulatedData.current[existingIndex] = dataObject;
      }
    
      if (!isInitialLoadCompleted && lastStrike && dataObject.strikePrice === lastStrike) {
        paytmSocketStore.setData(accumulatedData.current);
        setInitialLoadCompleted(true);
      } else if (lastStrike && dataObject.strikePrice !== lastStrike) {
        paytmSocketStore.updateData(dataObject);
      }
      
      // Set the response received flag to true
      responseReceived.current = true;
    };
    
    const handleError = (error: Event) => {
      console.error("WebSocket Error:", error);
      responseReceived.current = true;
    };

    const handleClose = (event: CloseEvent) => {
      console.log("WebSocket Disconnected with code:", event.code, "reason:", event.reason);
      responseReceived.current = true;
    };

    socket.current.onopen = handleOpen;
    socket.current.onmessage = handleMessage;
    socket.current.onerror = handleError;
    socket.current.onclose = handleClose;

    return () => {
      if (socket.current) {
        socket.current.close();
      }
    };
  }, [url, isInitialLoadCompleted]);

  useEffect(() => {
    // Establish WebSocket connection on component mount
    connectWebSocket();

    // Cleanup function
    return () => {
      if (socket.current) {
        socket.current.close();
      }
    };
  }, []);

  // Retry logic after waiting for a certain duration
  useEffect(() => {
    const retryTimeout = setTimeout(() => {
      // Retry only if no response has been received
      if (!responseReceived.current) {
        console.log("No response received. Retrying...");
        connectWebSocket();
      }
    }, 3000); // Wait for 3 seconds before retrying

    // Cleanup function
    return () => clearTimeout(retryTimeout);
  }, [responseReceived.current]);

  useEffect(() => {
    // Re-establish WebSocket connection when selectedSymbol changes
    const symbolChangeHandler = autorun(() => {
      connectWebSocket();
    });
    return () => symbolChangeHandler();
  }, [paytmSocketStore.selectedSymbol]);

  useEffect(() => {
    // Re-establish WebSocket connection when selectedExpiry changes
    const expiryChangeHandler = autorun(() => {
      connectWebSocket();
    });
    return () => expiryChangeHandler();
  }, [paytmSocketStore.selectedExpiry]);

  const sendSymbolAndExpiry = () => {
    const selectedSymbol = paytmSocketStore.selectedSymbol || "NIFTY";
    const selectedExpiry = paytmSocketStore.selectedExpiry || "2024-04-25";
      
    if (selectedExpiry) {
      const formattedExpiry = formatDate(selectedExpiry);
      if (!formattedExpiry) {
        console.error("Invalid expiry date format. Please provide a valid date.");
        return;
      }

      const message = JSON.stringify({ symbol: selectedSymbol, expiry: selectedExpiry });

      if (socket.current && socket.current.readyState === WebSocket.OPEN) {
        socket.current.send(message);
        console.log("Sent symbol and expiry:", message);
      }
    } else {
      console.error("Expiry date is not defined. Please set the expiry date before sending the message.");
    }
  };

  // Function to format the date as 'YYYY-MM-DD'
  const formatDate = (dateString: string) => {
    if (dateString) {
      const dateParts = dateString.split('-');
      const year = dateParts[2];
      const month = dateParts[1];
      const day = dateParts[0];
      return `${year}-${month}-${day}`;
    } else {
      return "";
    }
  };

  return { isInitialLoadCompleted, connectWebSocket };
};
