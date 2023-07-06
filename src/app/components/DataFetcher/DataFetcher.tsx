import { useEffect } from 'react';
import axios from 'axios';

interface OptionData {
    strikePrice: number;
    expiryDate: string;
    underlying: string;
    identifier: string;
    openInterest: number;
    changeinOpenInterest: number;
    pchangeinOpenInterest: number;
    totalTradedVolume: number;
    impliedVolatility: number;
    lastPrice: number;
    change: number;
    pChange: number;
    totalBuyQuantity: number;
    totalSellQuantity: number;
    bidQty: number;
    bidprice: number;
    askQty: number;
    askPrice: number;
    underlyingValue: number;
  }
  
  interface RecordData {
    strikePrice: number;
    expiryDate: string;
    CE?: OptionData;
    PE?: OptionData;
  }

  interface DataFetcherProps {
    symbol: string;
    onDataFetch: (data: RecordData[]) => void;
  }
  
  const DataFetcher: React.FC<DataFetcherProps> = ({ onDataFetch }) => {
    useEffect(() => {
      const fetchOptionChainData = async () => {
        try {
          const response = await axios.get(`http://localhost:9000/api/option-chain/`);
          const responseData = response.data;
  
          // Find the most recent expiry date
          const expiryDates: string[] = responseData.expiry_dates;
          const upcomingExpiryDate: string = expiryDates[0]; // assuming the first date in the array is the upcoming date
  
          // Filter the option_chain_data for the upcoming expiry date
          const filteredData = responseData.option_chain_data.filter((record: RecordData) => record.expiryDate === upcomingExpiryDate);
  
          localStorage.setItem('optionChainData', JSON.stringify(filteredData));
          onDataFetch(filteredData);
        } catch (error) {
          console.log('Error fetching option chain data:', error);
        }
      };
  
      fetchOptionChainData();
    }, [onDataFetch]);
  
    return null;
  };
  
  
  export default DataFetcher;