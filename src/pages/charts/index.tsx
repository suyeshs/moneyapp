// pages/chart.tsx
import { MongoClient } from 'mongodb';
import { GetServerSideProps } from 'next';
import ChartComponent from '../../app/components/SentimentChart/ChartComponent';

interface ChartData {
    datetime: string;
    stock_code: string;
    exchange_code: string;
    product_type: string;
    expiry_date: string;
    right: string;
    strike_price: string;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
    open_interest: string | null;
  }

interface ChartPageProps {
  data: ChartData[];
}

const ChartPage: React.FC<ChartPageProps> = ({ data }) => {
  return <ChartComponent data={data} />;
};


export const getServerSideProps: GetServerSideProps = async () => {
    const client = new MongoClient('mongodb://thestonepot:5PZAXjH03P4IT7pDuzBn3A7w1mzHwt0nIphn1shsO936Fj60clpMjdFig7BVrCsQabGfOaefWunWACDbuoUNRw%3D%3D@thestonepot.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@thestonepot@');
    
    try {
      await client.connect();
      console.log('Connected to the database');
  
      const collection = client.db('tradepod').collection('HisoricalDaily');
      const data = await collection.find({}).toArray();
      console.log('Fetched data:', data);
  
      return {
        props: {
          data: JSON.parse(JSON.stringify(data)), // Next.js requires the data to be serializable
        },
      };
    } catch (error) {
      console.error('An error occurred:', error);
      return { props: {} }; // Return an empty props object in case of error
    } finally {
      client.close();
      console.log('Connection closed');
    }
  }

export default ChartPage;