import { MongoClient } from 'mongodb';
import { aggregateDailyData, ChartData } from '../utils/dataAggregation';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

export async function fetchHistoricalData(specificStrikePrice: number, startDate: Date, endDate: Date) {
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/"; // Use MongoDB URI from environment variable or fallback to default

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
        const chartRecords: ChartData[] = (await db.collection('historical').find(query).toArray()).map(doc => ({
            date: doc.date,
            openInterest: doc.openInterest,
            strikePrice: doc.strikePrice,
            ltp: doc.ltp,
            optionType: doc.optionType,
            
        }));
        console.log("Chart Records",chartRecords)
        return aggregateDailyData(chartRecords, startDate,endDate);
    } finally {
        client.close();
    }
}
