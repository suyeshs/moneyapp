import { useEffect, useState } from 'react';

const TickDataPage = () => {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const ws = new WebSocket('ws://127.0.0.1:8001/ws/tick_data/');

    ws.onopen = () => {
      console.log('connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessage(data.message);
    };

    ws.onerror = (error) => {
      console.log('WebSocket error: ', error);
    };

    ws.onclose = () => {
      console.log('disconnected');
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div>
      <h1>Tick Data</h1>
      {message && <p>{message}</p>}
    </div>
  );
};

export default TickDataPage;