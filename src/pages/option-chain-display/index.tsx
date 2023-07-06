import { useState, useEffect } from 'react';
import { DataTable, Box, Select,Button } from 'grommet';
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

interface FlattenedData {
  strikePrice: number;
  expiryDate: string;
  CE_openInterest?: number;
  CE_lastPrice?: number;
  PE_openInterest?: number;
  PE_lastPrice?: number;
}

interface OptionChainDisplayProps {}

const OptionChainDisplay: React.FC<OptionChainDisplayProps> = () => {
  const [data, setData] = useState<RecordData[]>([]);
  const [expiryDates, setExpiryDates] = useState<string[]>([]);
  const [selectedExpiryDate, setSelectedExpiryDate] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOptionChainData = async () => {
      try {
        const response = await axios.get(`http://localhost:9000/api/option-chain/`);
        const responseData = response.data;
        const optionChainData: RecordData[] = responseData.option_chain_data;

        const upcomingExpiryDate: string = responseData.expiry_dates[0];

        const filteredData: RecordData[] = optionChainData.filter(
          record => record.expiryDate === upcomingExpiryDate && (record.CE || record.PE)
        );

        localStorage.setItem('optionChainData', JSON.stringify(filteredData));
        setData(filteredData);
        setExpiryDates(responseData.expiry_dates);
        setError(null);
      } catch (error) {
        console.log('Error fetching option chain data:', error);
        setError('Error fetching option chain data');
      }
    };

    const storedData = localStorage.getItem('optionChainData');
    if (storedData) {
      setData(JSON.parse(storedData));
    } else {
      fetchOptionChainData();
    }
  }, []);

  const flattenedData = data.map((item, index) => ({
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

  const handleExpiryDateChange = (selectedOption: any) => {
    setSelectedExpiryDate(selectedOption.value);
  };

  return (
    <Box pad="large">
       
      <Select
        options={data.map(record => record.expiryDate).map(date => ({ label: date, value: date }))}
        value={{ label: selectedExpiryDate, value: selectedExpiryDate }}
        onChange={handleExpiryDateChange}
      />
     
      <DataTable columns={columns} data={flattenedData} />
    </Box>
  );
};

export default OptionChainDisplay;
