import { MongoClient } from 'mongodb';
import { aggregateDailyData, ChartData } from '../utils/dataAggregation';

export async function fetchHistoricalData(specificStrikePrice: number, startDate: Date, endDate: Date) {
    const uri = "mongodb://podadmin:Trade%401029@ns3151328.ip-151-106-34.eu:27017/";

    //const uri = "mongodb://ns3151328.ip-151-106-34.eu:27017/";
    const client = new MongoClient(uri);
    
    try {
        console.log("Connecting to MongoDB");
        await client.connect();
        console.log("Connected correctly to server");
        const db = client.db('tradepod');

        // Define the query object with your criteria
        const query = {
            strikePrice: 20000,
            date: {
                $gte: new Date("2023-09-30T18:30:00.000"),
                $lte: new Date("2023-11-26T00:00:00.000")
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