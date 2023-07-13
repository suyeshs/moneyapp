import { useState, useEffect } from 'react';
import { DataTable, Box, Text, Select } from 'grommet';
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

export default function NiftyOptions() {
  const [expiryDates, setExpiryDates] = useState<string[]>([]);
  const [symbols] = useState(['NIFTY', 'BANKNIFTY', /* other symbols */]);
  const [selectedExpiryDate, setSelectedExpiryDate] = useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string>(symbols[0]);
  const [data, setData] = useState<RecordData[]>([]);

  useEffect(() => {
    fetchOptionChainData(selectedSymbol);
  }, [selectedSymbol]);

  useEffect(() => {
    if (data.length > 0) {
      const dates = Array.from(new Set(data.map(record => record.expiryDate)));
      setExpiryDates(dates);
      setSelectedExpiryDate(dates[dates.length - 1]);
    }
  }, [data]);

  const fetchOptionChainData = (symbol: string) => {
    const baseUrl = process.env.REACT_APP_BASE_URL || ''; // Use the environment-specific base URL
    axios
      .get(`/api/option-chain`, { baseURL: baseUrl })
      .then(response => { 
        const responseData = response.data;
        setData(responseData.option_chain_data);
      })
      .catch(error => {
        console.log('Error fetching option chain data:', error);
      });
  };

  const filterDataByExpiryDate = (data: RecordData[], expiryDate: string) => {
    return data.filter(record => record.expiryDate === expiryDate);
  };


  const filteredData = filterDataByExpiryDate(data, selectedExpiryDate || '');
  const columns = [
    
    { property: 'CE_openInterest', header: 'CE OI' },
    { property: 'CE_changeinOpenInterest', header: 'CE CHNG IN OI' },
    { property: 'CE_totalTradedVolume', header: 'CE VOLUME' },
    { property: 'CE_impliedVolatility', header: 'CE IV' },
    { property: 'CE_lastPrice', header: 'CE LTP' },
    { property: 'CE_change', header: 'CE CHNG' },
    { property: 'strikePrice', header: 'STRIKE' },
    { property: 'PE_lastprice', header: 'PE Premium' },
    { property: 'PE_impliedVolatility', header: 'PE IV' },
    { property: 'PE_totalTradedVolume', header: 'PE VOLUME' },
    { property: 'PE_openInterest', header: 'PE OI' },
  ];
  
  const flattenedData = filteredData.map((item, index) => ({  // Added a key property
   
    strikePrice: item.strikePrice,
    CE_openInterest: item.CE?.openInterest,
    CE_changeinOpenInterest: item.CE?.changeinOpenInterest,
    CE_totalTradedVolume: item.CE?.totalTradedVolume,
    CE_impliedVolatility: item.CE?.impliedVolatility,
    CE_lastPrice: item.CE?.lastPrice,
    CE_change: item.CE?.change,
    PE_lastprice: item.PE?.lastPrice,
    PE_impliedVolatility: item.PE?.impliedVolatility,
    PE_totalTradedVolume: item.PE?.totalTradedVolume,
    PE_openInterest: item.PE?.openInterest,
  }));
  

  return (
    <Box pad="large">
      <Select
        options={expiryDates.map(date => ({ label: date, value: date }))}
        
      />
      <Select
        options={symbols.map(symbol => ({ label: symbol, value: symbol }))}
        value={{ label: selectedSymbol, value: selectedSymbol }}
        
      />
      <DataTable
        columns={columns}
        data={flattenedData}
      />
    </Box>
  );
}
