console.log("Web worker is running");

self.onmessage = (event) => {
    if (event.data.type === "START_WEBSOCKET_CONNECTION") {
        console.log('Attempting to open WebSocket connection...');

        const ws = new WebSocket('ws://localhost:8888/websocket');

        ws.onmessage = async function (event) { // Making this function async
            try {
                const rawData = event.data instanceof Blob ? await blobToText(event.data) : event.data;
                const parsedData = JSON.parse(rawData);
                console.log('Raw data received from WebSocket:', parsedData);

                // Transforming the data before posting to main thread
                const transformedData = transformData(parsedData);
                self.postMessage({ type: 'WEBSOCKET_DATA_INCOMING', data: transformedData });
            } catch (error) {
                console.error("Error processing message:", error, event.data);
            }
        };

        ws.onopen = () => {
            console.log('WebSocket connection established.');
            self.postMessage({ type: 'WEBSOCKET_OPEN' });
        };

        ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
            self.postMessage({ type: 'WEBSOCKET_ERROR', error: error });
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed.');
            self.postMessage({ type: 'WEBSOCKET_CLOSE' });
        };
    }
};

async function blobToText(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(blob);
    });
}

function transformData(rawData) {
    return rawData.map(item => {
        // Flattening the depth_packet object
        const depthPacket = {};
        Object.keys(item.depth_packet).forEach(key => {
            const packet = item.depth_packet[key];
            Object.keys(packet).forEach(packetKey => {
                depthPacket[`${key}_${packetKey}`] = packet[packetKey];
            });
        });

        // Returning a new object that includes all properties, including flattened depth_packet
        return {
            ...item,
            ...depthPacket,
            last_traded_time: new Date(item.last_traded_time * 1000).toLocaleString(), // Assuming the time is in seconds
        };
    });
}
