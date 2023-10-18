import React, { useEffect, useState } from 'react';
import CustomGrid from '../components/DataGrid/DataGridComponenet';

const WebSocketManager: React.FC = () => {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8888/websocket');

        ws.onmessage = (message) => {
            try {
                const parsedData = JSON.parse(message.data);
                console.log('Received:', parsedData);
                setData([parsedData]); // Update the state with the new data
            } catch (error) {
                console.error('Error parsing data', error);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };

        return () => {
            ws.close();
        };
    }, []);

    return (
        <div>
            <h2>Real-Time Data</h2>
            <CustomGrid data={data} />
        </div>
    );
};

export default WebSocketManager;
