import React, { useEffect, useState } from 'react';

interface StockData {
    ltp: number;
    security_id: number;
    last_traded_quantity: number;
    average_traded_price: number;
    volume_traded: number;
    total_buy_quantity: number;
    total_sell_quantity: number;
    open: number;
    close: number;
    high: number;
    low: number;
    change_percent: number;
    change_absolute: number;
    fifty_two_week_high: number;
    fifty_two_week_low: number;
    OI: number;
    OI_change: number;
}




const StocksPage: React.FC = () => {
    const [stocks, setStocks] = useState<{ [key: number]: StockData }>({});

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8888/websocket');

        ws.onmessage = (event) => {
            try {
                const newData: StockData = JSON.parse(event.data);
                setStocks(prevStocks => ({
                    ...prevStocks,
                    [newData.security_id]: newData,
                }));
            } catch (error) {
                console.error('Error parsing data or non-JSON message received', error);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };

        return () => {
            ws.close();
        };
    }, []);

    const displayedData = Object.values(stocks);

    return (
        <div>
            <h1>Real-Time Stock Data</h1>
            <table>
    <thead>
        <tr>
            <th>Security ID</th>
            <th>LTP</th>
            <th>Last Traded Quantity</th>
            <th>Average Traded Price</th>
            <th>Volume Traded</th>
            <th>Total Buy Quantity</th>
            <th>Total Sell Quantity</th>
            <th>Open</th>
            <th>Close</th>
            <th>High</th>
            <th>Low</th>
            <th>Change Percent</th>
            <th>Change Absolute</th>
            <th>52 Week High</th>
            <th>52 Week Low</th>
            <th>OI</th>
            <th>OI Change</th>
        </tr>
    </thead>
    <tbody>
    {displayedData.map(item => (
            <tr key={item.security_id}>
                <td>{item.security_id}</td>
                <td>{item.ltp}</td>
                <td>{item.last_traded_quantity}</td>
                <td>{item.average_traded_price}</td>
                <td>{item.volume_traded}</td>
                <td>{item.total_buy_quantity}</td>
                <td>{item.total_sell_quantity}</td>
                <td>{item.open}</td>
                <td>{item.close}</td>
                <td>{item.high}</td>
                <td>{item.low}</td>
                <td>{item.change_percent}</td>
                <td>{item.change_absolute}</td>
                <td>{item.fifty_two_week_high}</td>
                <td>{item.fifty_two_week_low}</td>
                <td>{item.OI}</td>
                <td>{item.OI_change}</td>
            </tr>
        ))}
    </tbody>
</table>

        </div>
    );
};

export default StocksPage;
