import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setData } from '../stores/websocketSlice';

export const useWebSocket = (url: string) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const socket = new WebSocket(url);

    socket.onopen = () => console.log("WebSocket Connected");
    socket.onmessage = (event) => {
        console.log("Raw data from WebSocket:", event.data); // Log raw data
      
        try {
          const data = JSON.parse(event.data);
          console.log("Parsed data:", data); // Log parsed data
          dispatch(setData(data));
        } catch (error) {
          console.error("Error parsing JSON:", error, event.data);
        }
      };
    socket.onclose = () => console.log("WebSocket Disconnected");

    return () => {
      socket.close();
    };
  }, [url, dispatch]);
};
