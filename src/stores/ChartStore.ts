import { useLocalObservable } from 'mobx-react-lite';
import axios from 'axios';

interface HistoricalData {
  // Define the shape of your historical data here
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
  open_interest: string;
  count: number;
}

export const useChartStore = () => {
  const store = useLocalObservable(() => ({
    historicalData: [] as HistoricalData[],
    fetchHistoricalData: async (symbol: string) => {
      try {
        const response = await axios.get(`/api/historicalData?symbol=${symbol}`);
        store.historicalData = response.data;
      } catch (error) {
        console.error('Error fetching historical data:', error);
      }
    },
  }));

  return store;
};