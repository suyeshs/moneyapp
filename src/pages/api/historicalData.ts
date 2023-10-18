import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("API called with symbol:", req.query.symbol);

  const { symbol, startDate, endDate } = req.query;

  if (typeof symbol !== 'string') {
    res.status(400).json({ error: 'Invalid symbol' });
    return;
  }

  if (!startDate || !endDate) {
    res.status(400).json({ error: 'Start date and end date are required' });
    return;
  }

  const client = new MongoClient('mongodb://thestonepot:5PZAXjH03P4IT7pDuzBn3A7w1mzHwt0nIphn1shsO936Fj60clpMjdFig7BVrCsQabGfOaefWunWACDbuoUNRw%3D%3D@thestonepot.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@thestonepot@');
  await client.connect();
  const db = client.db('nse_historical_options');
  const collection = db.collection('time_series');

  const start = new Date(String(startDate));
  const end = new Date(String(endDate));

  // Filter based on the provided date range and symbol
  const historicalData = await collection.find({
    symbol,
    timestamp: {
      $gte: start.toISOString(),
      $lte: end.toISOString()
    }
  }).toArray();

  console.log(historicalData); 

  interface AggregatedData {
    [date: string]: {
      totalOi: number;
      totalVolume: number;
      count: number;
    };
  }

  const aggregatedData = historicalData.reduce((acc: AggregatedData, data) => {
    const date = new Date(data.timestamp).toISOString().split('T')[0];

    if (!acc[date]) {
      acc[date] = {
        totalOi: 0,
        totalVolume: 0,
        count: 0,
      };
    }

    acc[date].totalOi += data.oi;
    acc[date].totalVolume += data.volume;
    acc[date].count += 1;

    return acc;
  }, {});

  await client.close();

  res.status(200).json(aggregatedData);
}
