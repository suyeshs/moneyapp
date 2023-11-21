import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setData, updateData } from '../stores/websocketSlice';

export const useWebSocket = (url: string) => {
  const dispatch = useDispatch();
  const [isInitialLoadCompleted, setIsInitialLoadCompleted] = useState(false);

  useEffect(() => {
    const socket = new WebSocket(url);

    socket.onopen = () => console.log("WebSocket Connected");
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (!isInitialLoadCompleted) {
          dispatch(setData(data)); // Initial data loading

          // Check if the condition to complete the initial load is met
          if (data.some(item => item.strikePrice === 21250)) {
            setIsInitialLoadCompleted(true);
          }
        } else {
          // Subsequent data updates
          data.forEach(update => {
            dispatch(updateData(update));
          });
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    };
    socket.onclose = () => console.log("WebSocket Disconnected");

    return () => {
      socket.close();
    };
  }, [url, dispatch, isInitialLoadCompleted]);

  return isInitialLoadCompleted; // You can return this value if needed
};
