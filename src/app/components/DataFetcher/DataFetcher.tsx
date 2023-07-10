import { useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { optionStore } from '../../../stores/OptionStore';

interface OptionData {
  exchange_code: string;
  product_type: string;
  stock_code: string;
  expiry_date: string;
  right: string;
  strike_price: number;
  ltp: number;
  ltt: string;
  best_bid_price: number;
  best_bid_quantity: string;
  best_offer_price: number;
  best_offer_quantity: string;
  open: number;
  high: number;
  low: number;
  previous_close: number;
  ltp_percent_change: number;
  upper_circuit: number;
  lower_circuit: number;
  total_quantity_traded: string;
  spot_price: string;
  ltq: string;
  open_interest: number;
  chnge_oi: number;
  total_buy_qty: string;
  total_sell_qty: string;
  greeks: {
    delta: number;
    gamma: number;
    vega: number;
    theta: number;
  };
}

interface RecordData {
  strikePrice: number;
  expiryDate: string;
  callOption?: OptionData;
  putOption?: OptionData;
}

interface DataFetcherProps {
  symbol: string;
  onDataFetch: (data: RecordData[]) => void;
}

const DataFetcher: React.FC<DataFetcherProps> = ({ symbol, onDataFetch }) => {
  useEffect(() => {
    const fetchOptionChainData = async () => {
      try {
        const response = await axios.get(`/api/option-chain`, {
          baseURL: 'http://localhost:9000',
        });
        const responseData = response.data;

        const callOptionChainData: OptionData[] = responseData.call_option_chain_data;
        const putOptionChainData: OptionData[] = responseData.put_option_chain_data;

        // Merge call and put option chain data based on strike price and expiry date
        const mergedData: RecordData[] = callOptionChainData.map((callOption) => {
          const matchingPutOption = putOptionChainData.find(
            (putOption) =>
              putOption.strike_price === callOption.strike_price &&
              putOption.expiry_date === callOption.expiry_date
          );
          return {
            strikePrice: callOption.strike_price,
            expiryDate: callOption.expiry_date,
            callOption,
            putOption: matchingPutOption,
          };
        });

        // Update the store with the merged data
        onDataFetch(mergedData);

        optionStore.setLastRefresh(new Date().toLocaleString());
        optionStore.setError(null);
      } catch (error) {
        const axiosError = error as AxiosError;
        console.error('Error fetching option chain data:', axiosError.message);
        optionStore.setError('Error fetching option chain data');
      }
    };

    fetchOptionChainData();
  }, [symbol, onDataFetch]);

  return null;
};

export default DataFetcher;
