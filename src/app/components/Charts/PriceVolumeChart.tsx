import React, { useEffect, useRef } from 'react';
import {
  createChart,
  IChartApi,
  UTCTimestamp,
} from 'lightweight-charts';
import { AggregatedData } from '../../utils/dataAggregation';

interface PriceVolumeChartProps {
  data: AggregatedData[];
}

const PriceVolumeChart: React.FC<PriceVolumeChartProps> = ({ data }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  // Function to convert date string to a timestamp in the format expected by the library
  const toChartTimeFormat = (dateString: string): UTCTimestamp => {
    const date = new Date(dateString);
    // Convert the date to a Unix timestamp (in seconds)
    const timestamp = Math.floor(date.getTime() / 1000);
    return timestamp as UTCTimestamp; // Cast to UTCTimestamp which is a number
  };

  useEffect(() => {
    console.log('Original Data:', data); // This should log the data passed to the component

    if (chartContainerRef.current && !chartRef.current) {
      console.log('Creating chart...');
      chartRef.current = createChart(chartContainerRef.current, { width: 900, height: 600 });

      const ceData = data.filter(item => item.optionType === 'CE').map(item => ({
        time: toChartTimeFormat(item.date),
        value: Number(item.averagePrice),
      }));

      const peData = data.filter(item => item.optionType === 'PE').map(item => ({
        time: toChartTimeFormat(item.date),
        value: Number(item.averagePrice),
      }));

      console.log('CE Data:', ceData);
      console.log('PE Data:', peData);

      if (ceData.length > 0) {
        const ceSeries = chartRef.current.addLineSeries({
          priceScaleId: 'right',
          color: 'green',
          lineWidth: 2,
          title: 'CE',
        });
        ceSeries.setData(ceData);
      }

      if (peData.length > 0) {
        const peSeries = chartRef.current.addLineSeries({
          priceScaleId: 'left',
          color: 'red',
          lineWidth: 2,
          title: 'PE',
        });
        peSeries.setData(peData);
      }
    }

    return () => {
      if (chartRef.current) {
        console.log('Removing chart...');
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [data]); // Dependency array should include only 'data' if the chart setup doesn't depend on other props

  return <div ref={chartContainerRef} style={{ position: 'relative', width: '100%', height: '500px' }} />;
};

export default PriceVolumeChart;
