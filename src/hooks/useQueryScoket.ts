// useWebSocketData.ts
import { useQuery } from 'react-query';
import { OptionData } from '../types';

const fetchDataFromWebSocket = async (url: string): Promise<OptionData[]> => {
  return new Promise((resolve) => {
    // Create a WebSocket connection
    const socket = new WebSocket(url);

    // Handle WebSocket connection open event
    socket.addEventListener('open', (event) => {
      console.log('WebSocket connection opened:', event);
     
    });

    // Handle WebSocket message event
    socket.addEventListener('message', (event) => {
      // Parse and handle the received data
      const receivedData: OptionData = JSON.parse(event.data);

      // Call the provided callback to handle the data
      // You might want to use this data in your component or store it using React Query
      // e.g., queryClient.setQueryData('websocketData', receivedData);

      // Log for demonstration purposes
      console.log('Received data from WebSocket:', receivedData);
    });

    // You might also want to handle errors and connection close events

    // You don't need to resolve with simulated data, as you are handling real-time data
  });
};

const useWebSocketData = (url: string) => {
  return useQuery('websocketData', () => fetchDataFromWebSocket(url));
};

export default useWebSocketData;
