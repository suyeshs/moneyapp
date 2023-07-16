import React, { useEffect, useState, useRef } from 'react';
import axios, { AxiosError } from 'axios';
import { GridComponent, ColumnsDirective, ColumnDirective } from '@syncfusion/ej2-react-grids';
import IconButton from '@mui/material/IconButton';
import CachedIcon from '@mui/icons-material/Cached';
import styles from './syncoptions.module.css';
import { optionStore } from '../../stores/OptionStore';


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


const BreezeSyncOptions: React.FC = () => {
  const [data, setData] = useState<RecordData[]>([]);
  const [lastRefresh, setLastRefresh] = useState<string>('');
  const gridRef = useRef<any>(null);

  useEffect(() => {
    console.log('Data updated:', data);
  }, [data]);

  useEffect(() => {
    fetchOptionChainData();
  }, []);

  const fetchOptionChainData = async () => {
    try {
      const baseUrl = process.env.REACT_APP_BASE_URL || ''; // Use the environment-specific base URL
      const response = await axios.get(`/api/options-chain`, { baseURL: 'http://localhost:8000'});
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
      setData(mergedData);

      optionStore.setLastRefresh(new Date().toLocaleString());
      optionStore.setError(null);
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error fetching option chain data options chain :', axiosError.message);
      optionStore.setError('Error fetching option chain data');
    }
  };
  

  const handleRefresh = () => {
    fetchOptionChainData();
  };

  const ceCellTemplateDelta = (rowData: any) => (
    <div>
      <div className={styles.rowNumbers}>{rowData.callOption?.lastPrice}</div>
      <div className={styles.rowNumbers}>Delta: {rowData.callOption?.delta}</div>
    </div>
  );

  const peCellTemplateDelta = (rowData: any) => (
    <div>
      <div>{rowData.putOption?.lastPrice}</div>
      <div>Delta: {rowData.putOption?.delta}</div>
    </div>
  );

  return (
    <div className={styles.flexContainer}>
      <div>
        <div className={styles.statusContainer}>
          <div>Last Data Fetch: {lastRefresh}</div>
          <IconButton onClick={handleRefresh}>
            <CachedIcon />
          </IconButton>
        </div>
        <div>
          <GridComponent
            ref={gridRef}
            dataSource={data}
            enableHover={false}
            allowSelection={false}
            enableStickyHeader={true}
          >
            <ColumnsDirective>
              <ColumnDirective
                headerText="CE Premium"
                template={ceCellTemplateDelta}
              />
              <ColumnDirective
                headerText="Strike Price"
                field="strikePrice"
              />
              <ColumnDirective
                headerText="PE Premium"
                template={peCellTemplateDelta}
              />
            </ColumnsDirective>
          </GridComponent>
        </div>
      </div>
    </div>
  );
};

export default BreezeSyncOptions;
