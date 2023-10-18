import React from 'react';

interface DepthPacket {
    buy_quantity: number;
    sell_quantity: number;
    buy_order: number;
    sell_order: number;
    buy_price: number;
    sell_price: number;
}

interface Data {
    ltp: number;
    last_traded_time: number;
    security_id: number;
    depth_packet: { [key: string]: DepthPacket };
    // Add more fields as per your actual data structure
}

type Props = {
    data: Data[];
};

const DataGridComponent: React.FC<Props> = ({ data }) => {
    const renderDepthPacket = (depthPacket: { [key: string]: DepthPacket } | null | undefined) => {
        if (!depthPacket) {
            return <div>No data available</div>;
        }
    
        return Object.keys(depthPacket).map((key) => (
            <div key={key}>
                <h4>{key}</h4>
                <ul>
                    <li>Buy Quantity: {depthPacket[key].buy_quantity}</li>
                    <li>Sell Quantity: {depthPacket[key].sell_quantity}</li>
                    <li>Buy Order: {depthPacket[key].buy_order}</li>
                    <li>Sell Order: {depthPacket[key].sell_order}</li>
                    <li>Buy Price: {depthPacket[key].buy_price}</li>
                    <li>Sell Price: {depthPacket[key].sell_price}</li>
                </ul>
            </div>
        ));
    };
    

    if (data.length === 0) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            {data.map((item, index) => (
                <div key={index}>
                    <h3>Data {index + 1}</h3>
                    <ul>
                        <li>LTP: {item.ltp}</li>
                        <li>Last Traded Time: {item.last_traded_time}</li>
                        <li>Security ID: {item.security_id}</li>
                        {/* Add all other fields as list items */}
                    </ul>
                    <div>
                        <h3>Depth Packet</h3>
                        {renderDepthPacket(item.depth_packet)}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DataGridComponent;
