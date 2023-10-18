import React, { useEffect, useState } from 'react';

interface DepthPacket {
    buy_quantity: number;
    sell_quantity: number;
    buy_order: number;
    sell_order: number;
    buy_price: number;
    sell_price: number;
}

interface StockData {
    ltp: number;
    last_traded_time: number;
    security_id: number;
    depth_packet: { [key: string]: DepthPacket };
}

const StocksPage: React.FC = () => {
    const [data, setData] = useState<StockData[]>([]);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8888/websocket');

        ws.onmessage = (event) => {
            try {
                const messageData: StockData[] = JSON.parse(event.data);
                console.log('Parsed JSON:', messageData);

                setData((prevData) => {
                    // Update the state with the new depth packets
                    const newData = [...prevData];
                    messageData.forEach((incomingData) => {
                        const existingDataIndex = newData.findIndex(
                            (d) => d.security_id === incomingData.security_id
                        );

                        if (existingDataIndex !== -1) {
                            newData[existingDataIndex] = incomingData;
                        } else {
                            newData.push(incomingData);
                        }
                    });
                    return newData;
                });

            } catch (error) {
                console.error('Error parsing data or non-JSON message received', error);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };

        return () => {
            ws.close(); // Close WebSocket connection when the component unmounts
        };
    }, []);

    return (
        <div>
            <h1>Real-Time Stock Data</h1>
            <table border={1}>  {/* Updated this line */}

                <thead>
                    <tr>
                        <th>Security ID</th>
                        <th>LTP</th>
                        <th>Last Traded Time</th>
                        <th>Depth Packet</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={item.security_id}>
                            <td>{item.security_id}</td>
                            <td>{item.ltp}</td>
                            <td>{new Date(item.last_traded_time * 1000).toLocaleString()}</td>
                            <td>
                            <table border={1}>  {/* Updated this line */}

                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Buy Quantity</th>
                                            <th>Sell Quantity</th>
                                            <th>Buy Order</th>
                                            <th>Sell Order</th>
                                            <th>Buy Price</th>
                                            <th>Sell Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.keys(item.depth_packet).map((key) => {
                                            const dp = item.depth_packet[key];
                                            return (
                                                <tr key={key}>
                                                    <td>{key}</td>
                                                    <td>{dp.buy_quantity}</td>
                                                    <td>{dp.sell_quantity}</td>
                                                    <td>{dp.buy_order}</td>
                                                    <td>{dp.sell_order}</td>
                                                    <td>{dp.buy_price}</td>
                                                    <td>{dp.sell_price}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StocksPage;
