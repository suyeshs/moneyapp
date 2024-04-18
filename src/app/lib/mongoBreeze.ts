import { MongoClient } from 'mongodb';
import {  ChartData } from '../utils/dataAggregation';

export async function fetchHistoricalData(specificStrikePrice: number, startDate: Date, endDate: Date) {
    const uri = "mongodb://127.0.0.1:27017/";

    //const uri = "mongodb://ns3151328.ip-151-106-34.eu:27017/";
    const client = new MongoClient(uri);
    
    try {
        console.log("Connecting to MongoDB");
        await client.connect();
        console.log("Connected correctly to server");
        const db = client.db('tradepod');

        // Define the query object with your criteria
        const query = {
            strikePrice: specificStrikePrice,
            date: {
                $gte: startDate,
                $lte: endDate
            }
        };
        
        console.log("Query object:", query);

        // Use the query object in the find method
        const chartRecords: ChartData[] = (await db.collection('historicalDataBreeze').find(query).toArray()).map(doc => ({
            date: doc.datetime,
            openInterest: doc.open_interest,
            strikePrice: doc.strike_price,
            ltp: doc.close,
            optionType: doc.right,
            
        }));
        console.log("Chart Records",chartRecords)
        return chartRecords;
    } finally {
        client.close();
    }
}