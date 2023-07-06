import React, { useEffect, useState, useRef } from 'react';
import axios, { AxiosError } from 'axios';
import { GridComponent, ColumnsDirective, ColumnDirective, RowDataBoundEventArgs  } from '@syncfusion/ej2-react-grids';
import IconButton from '@mui/material/IconButton';
import CachedIcon from '@mui/icons-material/Cached';
import styles from './syncoptions.module.css';



interface OptionData {
  strikePrice: number;
  expiryDate: string;
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
  vega: number;
  gamma: number;
  theta: number;
  delta: number;
}

interface RecordData {
  strikePrice: number;
  expiryDate: string;
  CE?: OptionData;
  PE?: OptionData;
}

interface FlattenedData {
  strikePrice: number;
  expiryDate: string;
  
  CE_openInterest?: number;
  CE_changeInOIValue?: number;
  CE_changeinOpenInterest: number;
  CE_lastPrice?: number;
  CE_totalTradedVolume?: number;
  CE_impliedVolatility?: number;
  CE_change?: number;
  CE_pChange?: number;
  CE_strikePrice?: number;
  PE_underlyingValue:number;
  PE_openInterest?: number;
  PE_lastPrice?: number;
  PE_totalTradedVolume?: number;
  PE_changeinOpenInterest?: number;
  PE_impliedVolatility?: number;
  PE_pChange?: number;
  PE_strikePrice?: number;
  CE_vega?: number;
  CE_gamma?: number;
  CE_theta?: number;
  CE_delta?: number;
  PE_vega?: number;
  PE_gamma?: number;
  PE_theta?: number;
  PE_delta?: number;
}


interface SyncProps {}

const flattenRecord = (record: RecordData): FlattenedData => ({
  strikePrice: record.strikePrice,
  expiryDate: record.expiryDate,
  //CE Data
  CE_openInterest: record.CE?.openInterest || 0,
  CE_changeinOpenInterest: record.CE?.changeinOpenInterest || 0,
  CE_totalTradedVolume: record.CE?.totalTradedVolume || 0,
  CE_impliedVolatility: record.CE?.impliedVolatility || 0,
  CE_lastPrice: record.CE?.lastPrice || 0,
  CE_vega: record.CE?.vega || 0,
  CE_gamma: record.CE?.gamma || 0,
  CE_theta: record.CE?.theta || 0,
  CE_delta: record.CE?.delta || 0,
  //PE Data
  PE_openInterest: record.PE?.openInterest || 0,
  PE_lastPrice: record.PE?.lastPrice || 0,
  PE_totalTradedVolume: record.PE?.totalTradedVolume || 0,
  PE_impliedVolatility: record.PE?.impliedVolatility || 0,
  PE_changeinOpenInterest: record.PE?.changeinOpenInterest || 0, // This should be here
  PE_vega: record.PE?.vega || 0,
  PE_gamma: record.PE?.gamma || 0,
  PE_theta: record.PE?.theta || 0,
  PE_delta: record.PE?.delta || 0,
  PE_underlyingValue: record.PE?.underlyingValue || 0,
});



const SyncOptions: React.FC<SyncProps> = () => {
  const [data, setData] = useState<FlattenedData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<string>('');
  const [isClient, setIsClient] = useState(false);
  const [highlightedRows, setHighlightedRows] = useState([]);
  const [niftyValue, setNiftyValue] = useState<number | null>(null);
  const [closestStrikePrice, setClosestStrikePrice] = useState<number | null>(null);
  const gridRef = useRef<any>(null);

  // Add the useEffect hook here
useEffect(() => {
  console.log('Data updated:', data);
}, [data]);

useEffect(() => {
  setIsClient(true);
}, []);



 useEffect(() => {
    if (data.length > 0) {
      const index = data.reduce((maxIndex, item, index, arr) =>
        (item.CE_openInterest ?? 0) > (arr[maxIndex]?.CE_openInterest ?? 0) ? index : maxIndex
      , 0);
      setMaxCE_OIIndex(index);
    }
  }, [data]);

 
 


  
  const fetchOptionChainData = async () => {
    try {
      const response = await axios.get(`https://tradepod.azurewebsites.net/api/option-chain/`);
      const responseData = response.data;
      console.log("Fetched Response Data: ", responseData);
  
      const optionChainData: RecordData[] = responseData.option_chain_data;
      console.log("Fetched Option Chain Data: ", optionChainData);
  
      const upcomingExpiryDate: string = responseData.expiry_dates[0];
      console.log("Upcoming Expiry Date: ", upcomingExpiryDate);
  
      const filteredData: RecordData[] = optionChainData.filter(
        record => record.expiryDate === upcomingExpiryDate && (record.CE || record.PE)
      );
  
      const flattenedData = filteredData.map(flattenRecord);
      
      // Assuming first record's underlyingValue can be used as nifty value
      const firstRecord = flattenedData[0];
      
      if(firstRecord) {
        setNiftyValue(firstRecord.PE_underlyingValue);
      }
  
      // Store the data and current time in local storage
      localStorage.setItem('optionChainData', JSON.stringify(flattenedData));
      localStorage.setItem('lastFetchTime', new Date().toISOString());
        
      setData(flattenedData);
  
      if (flattenedData.length > 0 && niftyValue !== null) {
        const roundedNiftyValue = Math.round(niftyValue);
        let minDiff = Infinity;
        let closestStrike = null;
        
        flattenedData.forEach((item) => {
          let diff = Math.abs(roundedNiftyValue - item.strikePrice);
          if (diff < minDiff) {
            minDiff = diff;
            closestStrike = item.strikePrice;
          }
        });
      setClosestStrikePrice(closestStrike);
    }
  
      setLastRefresh(new Date().toLocaleString());
        
      setIsClient(true);
  
      setError(null);
    } catch (error) {

    
    
      const axiosError = error as AxiosError;
      console.error('Error fetching option chain data:', axiosError.message);
      console.log("Setting Error Message");
      setError('Error fetching option chain data');
    }
  };
  
  useEffect(() => {
    const storedData = localStorage.getItem('optionChainData');
    if (storedData) {
        const parsedData = JSON.parse(storedData) as FlattenedData[];
        // Filter the data to ignore values where PE_openInterest and CE_openInterest are less than 1000
        const filteredData = parsedData.filter(item => (item.PE_openInterest ?? 0) >= 100 && (item.CE_openInterest ?? 0) >= 100);


        
        setData(filteredData);
        setNiftyValue(filteredData[0]?.PE_underlyingValue || null);
        // added closest strike price calculation after loading data from local storage
        const roundedNiftyValue = Math.round(filteredData[0]?.PE_underlyingValue || 0);
        let minDiff = Infinity;
        let closestStrike = null;
        
        filteredData.forEach((item) => {
            let diff = Math.abs(roundedNiftyValue - item.strikePrice);
            if (diff < minDiff) {
                minDiff = diff;
                closestStrike = item.strikePrice;
            }
        });
        setClosestStrikePrice(closestStrike);
    } else {
        fetchOptionChainData();
    }
}, []);


  const [maxCE_OIIndex, setMaxCE_OIIndex] = useState<number | null>(null);
  useEffect(() => {
    if (data.length > 0) {
      const index = data.reduce((maxIndex, item, index, arr) =>
        (item.CE_openInterest ?? 0) > (arr[maxIndex]?.CE_openInterest ?? 0) ? index : maxIndex
      , 0);
    
      setMaxCE_OIIndex(index);
    }
  }, [data]);

 

  const handleRefresh = () => {
    fetchOptionChainData();
  };

  // Cell templates for displayiong multiple values
  //CE
  const ceCellTemplateDelta = (rowData: any) => (
    <div>
      <div className={styles.rowNumbers}>  {rowData.CE_lastPrice}</div>
      <div className={styles.rowNumbers}>Delta: {rowData.CE_delta}</div>
    </div>
  );

  const ceCellTemplateVega = (rowData: any) => (
    <div>
      <div className={styles.rowNumbers}>{rowData.CE_openInterest} ({rowData.CE_changeinOpenInterest})</div>
      <div className={styles.rowNumbers}>Vega: {rowData.CE_vega}</div>
    </div>
  );

  const ceCellTemplateGamma = (rowData: any) => (
    <div>
      <div>  {rowData.CE_totalTradedVolume}</div>
      <div>Gamma: {rowData.CE_gamma}</div>
    </div>
  );

  const ceCellTemplateTheta = (rowData: any) => (
    <div>
      <div>  {rowData.CE_impliedVolatility}</div>
      <div>Theta: {rowData.CE_theta}</div>
    </div>
  );

  //PE
  const peCellTemplateDelta = (rowData: any) => (
    <div>
      <div>  {rowData.PE_lastPrice}</div>
      <div>Delta: {rowData.PE_delta}</div>
    </div>
  );

  const peCellTemplateVega = (rowData: any) => (
    <div>
      <div>{rowData.PE_openInterest} ({rowData.PE_changeinOpenInterest})</div>
      <div>Vega: {rowData.PE_vega}</div>
    </div>
  );

  const peCellTemplateGamma = (rowData: any) => (
    <div>
      <div>  {rowData.PE_totalTradedVolume}</div>
      <div>Gamma: {rowData.PE_gamma}</div>
    </div>
  );

  const peCellTemplateTheta = (rowData: any) => (
    <div>
      <div>  {rowData.PE_impliedVolatility}</div>
      <div>Theta: {rowData.PE_theta}</div>
    </div>
  );

  
  const [lastFetchTime, setLastFetchTime] = useState('N/A');

  useEffect(() => {
    const storedTime = localStorage.getItem('lastFetchTime');
    if (storedTime) {
      setLastFetchTime(storedTime);
    }
  }, []);
 


 
  return (
    <div className={styles.flexContainer} >
      <div >

        <div className={styles.statusContainer}>
        <div>Last Data Fetch: {lastFetchTime}</div>
             <IconButton onClick={handleRefresh}>
             <CachedIcon />
            </IconButton>
      
   
       
            <div  className={styles.eCard} id="basic">
          Last Data Fetch: {typeof window !== 'undefined' ? localStorage.getItem('lastFetchTime') || 'N/A' : 'N/A'}
        </div>
        <div  className={styles.eCard} id="basic">
          Nifty Value: {niftyValue ?? "N/A"} 
        </div>
      </div>
     
    
    <div>
    <GridComponent ref={gridRef} dataSource={data} enableHover={false} allowSelection={false} enableStickyHeader={true}
      queryCellInfo={args => {
        if (args.column.field === 'strikePrice') {
          args.cell.style.backgroundColor = '#C9C8C8';
        }
      }}

      rowDataBound={args => {
        if (args.data.strikePrice === closestStrikePrice) {
          args.row.style.backgroundColor = 'yellow';
        }
        console.log("Row Data Bound: ", closestStrikePrice);
      }}
      
    >
        <ColumnsDirective>
          <ColumnDirective headerText=' OI' template={ceCellTemplateVega} />
          
          <ColumnDirective field='CE_totalTradedVolume' headerText='VOLUME'  template={ceCellTemplateGamma}/>
          <ColumnDirective field='CE_impliedVolatility' headerText='IV' template={ceCellTemplateTheta} />
          <ColumnDirective field='CE_lastPrice' headerText='PREMIUM' template={ceCellTemplateDelta}/>
          
          <ColumnDirective field='strikePrice' headerText='STRIKE PRICE' headerTemplate={() => <span className="column-header">STRIKE PRICE</span>} />
          

          <ColumnDirective field='PE_lastPrice' headerText='PREMIUM' template={peCellTemplateDelta} />
          <ColumnDirective field='PE_impliedVolatility' headerText='IV' template={peCellTemplateTheta}  />
          <ColumnDirective field='PE_totalTradedVolume' headerText='VOLUME'  template={peCellTemplateGamma}/>
          <ColumnDirective field='PE_openInterest' headerText='OI' template={peCellTemplateVega}  />
        </ColumnsDirective>
      </GridComponent>
      </div>
    </div>
  </div>
  );
}

export async function getStaticProps() {
  try {
    const response = await axios.get(`https://tradepod.azurewebsites.net/api/option-chain/`);
    const responseData = response.data;

    const optionChainData = responseData.option_chain_data;
    const upcomingExpiryDate = responseData.expiry_dates[0];

    const filteredData = optionChainData.filter(
      (record: RecordData) => record.expiryDate === upcomingExpiryDate && (record.CE || record.PE)
    );

    const flattenedData = filteredData.map(flattenRecord);
    const firstRecord = flattenedData[0];
    
    const niftyValue = firstRecord ? firstRecord.PE_underlyingValue : null;

    return {
      props: {
        initialData: flattenedData,
        initialNiftyValue: niftyValue
      },
      // Re-generate the page every 1 second
      revalidate: 1,
    }
  } catch (error) {
    console.error('Error fetching option chain data:',);
    return { props: {} };
  }
}


export default SyncOptions;
