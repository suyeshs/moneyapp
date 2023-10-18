import useSWR from 'swr';
import axios from 'axios';
import { ChartComponent } from '../../app/components/Charts/LineChart';
import { useState } from 'react';  // Import useState hook

const fetcher = (url: string) => axios.get(url).then(res => res.data);

function App(props: any) {
  // Managing state for start date and end date
  const [startDate, setStartDate] = useState('2023-01-01');
  const [endDate, setEndDate] = useState('2023-12-31');

  // Updated SWR to include startDate and endDate as query parameters
  const { data, error } = useSWR(`/api/historicalData?symbol=NIFTY&startDate=${startDate}&endDate=${endDate}`, fetcher);
  console.log('Chart Data', data);

  if (error) return <div>Error loading data</div>;
  if (!data) return <div>Loading...</div>;


  const chartData = data.map((item: any) => {
    
    let putVolume = 0;
    let callVolume = 0;
  
    if(item.data && Array.isArray(item.data)) {  // Check if item.data is defined and an array
      item.data.forEach((entry: any) => {
        if (entry.type === 'Put') {
          putVolume = entry.totalVolume;
        } else if (entry.type === 'Call') {
          callVolume = entry.totalVolume;
        }
      });
    }
    

    const ratio = callVolume === 0 ? 0 : putVolume / callVolume;
    const time = `${item._id.year}-${String(item._id.month).padStart(2, '0')}-01`;


    return {
      time,
      value: ratio
    };
  });

  console.log(chartData);  // Log transformed data for the chart

  return (
    <div>
      <div>
        <label>Start Date:</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />

        <label>End Date:</label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>

      <ChartComponent {...props} data={chartData}></ChartComponent>
    </div>
  );
}

export default App;
