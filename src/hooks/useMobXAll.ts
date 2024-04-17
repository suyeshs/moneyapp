import { useEffect, useRef } from 'react';
import { paytmStoreAll } from '../stores/PaytmStoreAll';
import { OptionData } from '../types';

export const useWebSocketMobX = (url: string) => {
  const socket = useRef<WebSocket | null>(null);

  useEffect(() => {
    socket.current = new WebSocket(url);

    socket.current.onopen = () => console.log("WebSocket Connected");
    socket.current.onmessage = (event) => {
      const dataObject: OptionData = JSON.parse(event.data); 
      console.log("Received data:", dataObject);

      // Update store with the received data
      paytmStoreAll.updateData(dataObject);
    };

    socket.current.onclose = () => {
      console.log("WebSocket Disconnected");
    };

    return () => {
      socket.current?.close();
    };
  }, [url]);

  // No need to return any value unless necessary for your specific use case
};
