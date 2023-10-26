import { useEffect, useRef, useState } from 'react';

export const useFeedWorker = () => {
  const worker = useRef<Worker | null>(null);
  const [dataFromWorker, setDataFromWorker] = useState<any>(null);

  useEffect(() => {
    // Initialize the worker
    try {
      worker.current = new Worker('/webWorker.js');
      console.log('Web worker initialized.');
    } catch (error) {
      console.error('Failed to initialize web worker:', error);
    }

    // Set up a function to handle messages from the worker
    const handleMessage = (event: MessageEvent) => {
      //console.log('Message from worker:', event.data); // Log all messages from worker
      switch (event.data.type) {
        case "WEBSOCKET_DATA_INCOMING": {
          console.log("Web worker sent main JS thread data!", event.data.data);
          setDataFromWorker(event.data.data);
          break;
        }
        default: {
          // Handle any other message types or errors here
          console.warn("Unhandled message from worker:", event.data);
        }
      }
    };

    // Listen for messages from the worker
    if (worker.current) {
      worker.current.onmessage = handleMessage;
    } else {
      console.error('Web worker is not available.');
    }

    // Send start message to worker
    if (worker.current) {
      console.log('Sending start message to worker');
      worker.current.postMessage({ type: 'START_WEBSOCKET_CONNECTION' });
    }

    // Clean up the worker when the hook consumer unmounts
    return () => {
      if (worker.current) {
        worker.current.terminate();
        console.log('Web worker terminated.');
      }
    };
  }, []);

  return { dataFromWorker };
};

export default useFeedWorker;
