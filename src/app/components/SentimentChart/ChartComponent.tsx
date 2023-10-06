// components/sentimentchart/ChartComponent.tsx
import { useEffect, useRef } from 'react';
import { createChart,  ISeriesApi, IChartApi  } from 'lightweight-charts';


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

interface ChartComponentProps {
  data: ChartData[];
}

const ChartComponent: React.FC<ChartComponentProps> = ({ data }) => {
  const chartContainerRef = useRef(null);
  let chart: IChartApi | undefined;
  let candleSeries: ISeriesApi<'Candlestick'> | undefined;

  

 

  useEffect(() => {
    if (chartContainerRef.current) {
      chart = createChart(chartContainerRef.current, { width: window.innerWidth, height: 300 });
      candleSeries = chart.addCandlestickSeries();
      window.addEventListener('resize', () => {
        if (chart) {
          chart.resize(window.innerWidth, 300);
        }
      });
    }
    const chartData = data.map(item => {
      const date = new Date(item.datetime);
      return {
        time: { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() },
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
      };
    });

    const sortedData = chartData.sort((a, b) => {
      const aDate = new Date(a.time.year, a.time.month - 1, a.time.day);
      const bDate = new Date(b.time.year, b.time.month - 1, b.time.day);
      return aDate.getTime() - bDate.getTime();
    });

    const uniqueData = sortedData.filter((item, index, self) =>
      index === self.findIndex((t) => (
        t.time.year === item.time.year && t.time.month === item.time.month && t.time.day === item.time.day
      ))
    );

    if (candleSeries) {
      candleSeries.setData(uniqueData);
    }
  }, [data]);

  return <div ref={chartContainerRef} />;
};

export default ChartComponent;