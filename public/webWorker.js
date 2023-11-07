console.log("Web worker is running");

self.onmessage = (event) => {
    if (event.data.type === "START_WEBSOCKET_CONNECTION") {
        console.log('Attempting to open WebSocket connection...');
        
        // Constructing the WebSocket URL
        const wsUrl = `ws://127.0.0.1:8888/tradepod`;
        //const wsUrl = `wss://tradepodsocket.suyeshs.repl.co/tradepod`;

        const ws = new WebSocket(wsUrl);

        ws.onmessage = async function (event) {
            try {
                if (event.data instanceof Blob) {
                    // If the incoming message is a Blob, convert it to an ArrayBuffer
                    const arrayBuffer = await event.data.arrayBuffer();
                    const dataView = new DataView(arrayBuffer);
                    
                    // Log the binary data received
                    //console.log('Binary data received:', dataView);
                } else {
                    // If the incoming message is not a Blob, log the raw data
                    const rawData = event.data;
                    console.log('Raw data from WebSocket:', rawData);

                    // Try to parse the raw data as JSON and log the parsed data
                    const parsedData = JSON.parse(rawData);
                    console.log('Parsed data:', parsedData);

                    // Post the parsed data back to the main thread
                    self.postMessage({ type: 'WEBSOCKET_DATA_INCOMING', data: parsedData });
                }
            } catch (error) {
                // If an error occurs, log the error and the data that caused the error
                console.error("Error processing message:", error, event.data);
            }
        };

        ws.onopen = () => {
            // Log when the WebSocket connection is established
            console.log('WebSocket connection established.');
            self.postMessage({ type: 'WEBSOCKET_OPEN' });
        };

        ws.onerror = (error) => {
            // Log any errors that occur with the WebSocket connection
            console.error('WebSocket Error:', error);
            self.postMessage({ type: 'WEBSOCKET_ERROR', error: error });
        };

        ws.onclose = () => {
            // Log when the WebSocket connection is closed
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
