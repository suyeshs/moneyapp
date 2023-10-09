import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { symbol } = req.query;

  if (typeof symbol !== 'string') {
    res.status(400).json({ error: 'Invalid symbol' });
    return;
  }

  const client = new MongoClient('mongodb://thestonepot:5PZAXjH03P4IT7pDuzBn3A7w1mzHwt0nIphn1shsO936Fj60clpMjdFig7BVrCsQabGfOaefWunWACDbuoUNRw%3D%3D@thestonepot.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@thestonepot@');
  await client.connect();
  const db = client.db('yourDatabaseName');
  const collection = db.collection('time_series');

  const historicalData = await collection.aggregate([
    { $match: { script: symbol } },
    { $project: { 
        year: { $year: "$datetime" }, 
        month: { $month: "$datetime" }, 
        day: { $dayOfMonth: "$datetime" }, 
        data: "$$ROOT" 
    }},
    { $group: { 
        _id: { year: "$year", month: "$month" }, 
        data: { $push: "$data" } 
    }},
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]).toArray();

  await client.close();

  res.status(200).json(historicalData);
}