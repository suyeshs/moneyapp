import React, { useEffect, useState } from 'react';

interface MessageData {
    message: string;
}

function WebSocketComponent() {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const socketInstance = new WebSocket('ws://localhost:8000/ws/tradepodapi/');

        socketInstance.onopen = function(e) {
            console.log('Connection established successfully');
        };

        socketInstance.onerror = function(e) {
            console.error('Error connecting to WebSocket');
            setError('Error connecting to WebSocket');
        };

        socketInstance.onmessage = function(e) {
            const data: MessageData = JSON.parse(e.data);
            console.log(data.message);
        };

        socketInstance.onclose = function(e) {
            console.error('Chat socket closed unexpectedly');
        };

        setSocket(socketInstance);

        return () => {
            if (socket) {
                socket.close();
            }
        };
    }, [socket]);

    const sendMessage = () => {
        if (socket && !error) {
            socket.send(JSON.stringify({
                'message': 'Hello, world!'
            }));
        }
    };

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <button onClick={sendMessage}>Send Message</button>
        </div>
    );
}

export default WebSocketComponent;