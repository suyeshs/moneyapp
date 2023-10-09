import useSWR from 'swr';
import axios from 'axios';
import  {ChartComponent}  from '../../app/components/Charts/LineChart'; // Assuming ChartComponent is in the same file

const fetcher = (url: string) => axios.get(url).then(res => res.data);

function App(props: any) {
  const { data, error } = useSWR(`/api/historicalData?symbol=NIFTY`, fetcher);

  if (error) return <div>Error loading data</div>;
  if (!data) return <div>Loading...</div>;

  // Process data into the format required by the chart
  const chartData = data.map((item: { _id: { year: number, month: number }, data: Array<{ datetime: string, close: number }> }) => {
    return {
      time: `${item._id.year}-${item._id.month}`,
      value: item.data.reduce((acc, curr) => acc + Number(curr.close), 0) / item.data.length // average close value for the month
    };
  });

  return (
    <ChartComponent {...props} data={chartData}></ChartComponent>
  );
}

export default App;