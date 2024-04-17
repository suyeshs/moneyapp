import { useEffect, useRef, useState, useCallback } from 'react';
import { paytmSocketStore } from '../stores/PaytmSocketStore';
import { OptionData } from '../types';
import { autorun } from 'mobx';

export const useWebSocketMobXCopy = (url: string) => {
  console.log("useWebSocketMobX called");
  
  const [isInitialLoadCompleted, setInitialLoadCompleted] = useState(false);
  const socket = useRef<WebSocket | null>(null);
  const accumulatedData = useRef<OptionData[]>([]);


  const connectWebSocketCopy = useCallback((symbolToSend: string, expiryToSend: string) => {
    // Establish WebSocket connection
    socket.current = new WebSocket(url);

    const handleOpen = () => {
      // Check if the expiry date is defined
      if (typeof expiryToSend !== 'undefined') {
        // Format the expiry date
        const formattedExpiry = formatDate(expiryToSend);
        if (!formattedExpiry) {
          console.error("Invalid expiry date format. Please provide a valid date.");
          return;
        }

        // Create the message object
        const message = JSON.stringify({ symbol: symbolToSend, expiry: expiryToSend });
        console.log("Sending message:", message);

        // Send the message if the socket is open
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
        const dateParts = dateString.split('-'); // Assuming the date string is in 'DD-MM-YYYY' format
        const year = dateParts[2];
        const month = dateParts[1];
        const day = dateParts[0];
        return `${year}-${month}-${day}`;
      } else {
        return ""; // Return an empty string or handle the case as appropriate
      }
    };

    const autorunCallback = autorun(() => {
      // Call connectWebSocket with the current symbol and expiry from the store
      connectWebSocketCopy(paytmSocketStore.selectedSymbol, paytmSocketStore.selectedExpiry || '2024-03-28');
    });
    

    const handleMessage = (event: MessageEvent) => {
      const dataObject: OptionData = JSON.parse(event.data);
      console.log("Received data:", dataObject);
      const existingIndex = accumulatedData.current.findIndex((item) => item.strikePrice === dataObject.strikePrice);

      if (existingIndex === -1) {
        accumulatedData.current.push(dataObject);
      } else {
        accumulatedData.current[existingIndex] = dataObject;
      }

      if (!isInitialLoadCompleted && dataObject.strikePrice === 23500) {
        paytmSocketStore.setData(accumulatedData.current);
        paytmSocketStore.setInitialLoadCompleted(true);

        
      }
      else {
        // Handle updates for each packet after initial load
        paytmSocketStore.updateData(dataObject);
      }
    };

    const handleError = (error: Event) => {
      console.error("WebSocket Error:", error);
    };

    const handleClose = (event: CloseEvent) => {
      console.log("WebSocket Disconnected with code:", event.code, "reason:", event.reason);
      // Reconnect WebSocket
      setTimeout(() => {
        // Reconnect with values from the store
        connectWebSocketCopy(symbolToSend, expiryToSend);
      }, 200000); // Retry after 2 seconds
    };

    // Add event listeners
    socket.current.onopen = handleOpen;
    socket.current.onmessage = handleMessage;
    socket.current.onerror = handleError;
    socket.current.onclose = handleClose;

    // Cleanup function
    return () => {
      socket.current?.close();
    };
  }, [url, isInitialLoadCompleted]);

  useEffect(() => {
    // Run autorun only once on component mount
    const disposeAutorun = autorun(() => {
        connectWebSocketCopy(paytmSocketStore.selectedSymbol || 'NIFTY', paytmSocketStore.selectedExpiry || '2024-03-28');
    });

    // Cleanup autorun
    return () => {
      disposeAutorun();
    };
  }, [connectWebSocketCopy]);

 

  // Return values and functions
  return { isInitialLoadCompleted, connectWebSocketCopy};
};

