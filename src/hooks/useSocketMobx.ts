import { useEffect, useRef, useState } from 'react';
import { paytmSocketStore } from '../stores/PaytmSocketStore';
import { OptionData } from '../types';

export const useWebSocket = (url: string) => {
  const [isInitialLoadCompleted, setInitialLoadCompleted] = useState(false);
  const socket = useRef<WebSocket | null>(null);
  const accumulatedData = useRef<OptionData[]>([]);

  useEffect(() => {
    socket.current = new WebSocket(url);

    socket.current.onopen = () => console.log("WebSocket Connected");
    socket.current.onmessage = (event) => {
      const dataObject: OptionData = JSON.parse(event.data);
      console.log("dataObject", dataObject);

      // Handle initial load and updates differently
      if (!isInitialLoadCompleted) {
        // Accumulate data for initial load
        accumulatedData.current.push(dataObject);

        // Check if the initial load condition is met
        if (dataObject.strikePrice === 21750) {
          paytmSocketStore.setData(accumulatedData.current);
          setInitialLoadCompleted(true);
          paytmSocketStore.setInitialLoadCompleted(true);
        }
      } else {
        // Handle updates for each packet after initial load
        paytmSocketStore.updateData(dataObject);
      }
    };

    socket.current.onclose = () => {
      console.log("WebSocket Disconnected");
      accumulatedData.current = [];
    };

    return () => {
      socket.current?.close();
    };
  }, [url, isInitialLoadCompleted]);

  return isInitialLoadCompleted;
};
