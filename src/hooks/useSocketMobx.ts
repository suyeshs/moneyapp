import { useEffect, useRef, useState } from 'react';
import { paytmSocketStore } from '../stores/PaytmSocketStore';
import { OptionData } from '../types';
import { toJS } from 'mobx';


export const useWebSocket = (url: string) => {
  const [isInitialLoadCompleted] = useState(false);
  const socket = useRef<WebSocket | null>(null);

  useEffect(() => {
    socket.current = new WebSocket(url);

    socket.current.onopen = () => console.log("WebSocket Connected");
    socket.current.onmessage = (event) => {
      const dataObject: OptionData = JSON.parse(event.data);
      //console.log("dataObject", dataObject);

      // Update the store with new data
      paytmSocketStore.setData([dataObject]);
      console.log("Use Socket",paytmSocketStore)

      // Check if the initial load condition is met
      if (!paytmSocketStore.isInitialLoadCompleted && dataObject.strikePrice === 21300) {
        paytmSocketStore.setInitialLoadCompleted(true);
      }
    };
    socket.current.onclose = () => console.log("WebSocket Disconnected");

    return () => {
      socket.current?.close();
    };
  }, [url]);


// Log the data

  return isInitialLoadCompleted;
};
