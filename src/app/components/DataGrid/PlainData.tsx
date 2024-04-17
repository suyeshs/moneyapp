import React, { useState, useEffect } from 'react';
import { StockData } from "../../../types";



const StockDataComponent: React.FC = () => {
  const [data, setData] = useState<StockData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('ws://localhost:9999/tradepod');
        const jsonData: StockData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Stock Data</h1>
      {data ? (
        <table>
          <thead>
            <tr>
              <th>Security ID</th>
              <th>LTP</th>
              <th>Last Traded Quantity</th>
              <th>Volume Traded</th>
              <th>Total Buy Quantity</th>
              <th>Total Sell Quantity</th>
              <th>Open</th>
              <th>Close</th>
              <th>High</th>
              <th>Low</th>
              <th>Change Percent</th>
              <th>Change Absolute</th>
              <th>OI</th>
              <th>OI Change</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{data.security_id}</td>
              <td>{data.ltp}</td>
              <td>{data.last_traded_quantity}</td>
              <td>{data.volume_traded}</td>
              <td>{data.total_buy_quantity}</td>
              <td>{data.total_sell_quantity}</td>
              <td>{data.open}</td>
              <td>{data.close}</td>
              <td>{data.high}</td>
              <td>{data.low}</td>
              <td>{data.change_percent}</td>
              <td>{data.change_absolute}</td>
              <td>{data.OI}</td>
              <td>{data.OI_change}</td>
            </tr>
          </tbody>
        </table>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default StockDataComponent;