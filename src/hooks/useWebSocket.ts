import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setData, updateData } from '../stores/websocketSlice';
import { OptionData } from '../types';


export const useWebSocket = (url: string) => {
  const dispatch = useDispatch();
  const [isInitialLoadCompleted, setIsInitialLoadCompleted] = useState(false);

  useEffect(() => {
    const socket = new WebSocket(url);

    socket.onopen = () => console.log("WebSocket Connected");
    socket.onmessage = (event) => {
      try {
        const dataObject = JSON.parse(event.data);
        console.log("Parsed data:", dataObject); // Log parsed data for inspection

        // Check if the condition to complete the initial load is met
        if (!isInitialLoadCompleted) {
          if (dataObject.strikePrice === 21700) {
            setIsInitialLoadCompleted(true);
          }
          dispatch(setData(dataObject));
        } else {
          // Handle updates
          dispatch(updateData(dataObject));
        }
      } catch (error) {
        console.error("Error parsing JSON:", error, event.data);
      }
    };
    socket.onclose = () => console.log("WebSocket Disconnected");

    return () => {
      socket.close();
    };
  }, [url, dispatch, isInitialLoadCompleted]);

  return isInitialLoadCompleted;
};
