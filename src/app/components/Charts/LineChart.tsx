import React, { useEffect, useRef } from "react";
import { AggregatedData } from '../../utils/dataAggregation';
import { createChart, CrosshairMode, IChartApi, UTCTimestamp } from "lightweight-charts";

interface PriceVolumeChartProps {
  data: AggregatedData[];
}

export default function PriceVolumeChart({ data }: PriceVolumeChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chart = useRef<IChartApi | undefined>();
  const resizeObserver = useRef<ResizeObserver>();

   // Function to convert date string to a timestamp in the format expected by the library
   const toChartTimeFormat = (dateString: string): UTCTimestamp => {
    const date = new Date(dateString);
    // Convert the date to a Unix timestamp (in seconds)
    const timestamp = Math.floor(date.getTime() / 1000);
    return timestamp as UTCTimestamp; // Cast to UTCTimestamp which is a number
  };

  useEffect(() => {
    if (!chartContainerRef.current || !data.length) return;
    console.log('Creating chart...');
    // Transform data to volumeData format
    //console.log('Data:', data);
    const volumeData = data.map(item => ({
      time: item.date,
      value: item.totalVolume
    }));

    const ceData = data.filter(item => item.optionType === 'CE').map(item => ({
      time: toChartTimeFormat(item.date),
      value: Number(item.averagePrice),
    }));

    const peData = data.filter(item => item.optionType === 'PE').map(item => ({
      time: toChartTimeFormat(item.date),
      value: Number(item.averagePrice),
    }));


    const priceData = data.map(item => ({
      time: item.date,
      value: item.totalVolume
    }));
    chart.current = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        background: { color: "#253248" },
        textColor: "rgba(255, 255, 255, 0.9)"
      },
      grid: {
        vertLines: {
          color: "#334158"
        },
        horzLines: {
          color: "#334158"
        }
      },
      crosshair: {
        mode: CrosshairMode.Normal
      },
      
      timeScale: {
        borderColor: "#485c7b"
      }
    });

    console.log(chart.current);

    const candleSeries = chart.current.addCandlestickSeries({
      upColor: "#4bffb5",
      downColor: "#ff4976",
      borderDownColor: "#ff4976",
      borderUpColor: "#4bffb5",
      wickDownColor: "#838ca1",
      wickUpColor: "#838ca1"
    });

    candleSeries.setData(priceData);

    const volumeSeries = chart.current.addHistogramSeries({
      color: "#182233",
      
      priceFormat: {
        type: "volume"
      },
      
    });

    volumeSeries.setData(volumeData);
  }, [data]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    resizeObserver.current = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      chart.current?.applyOptions({ width, height });
      setTimeout(() => {
        chart.current?.timeScale().fitContent();
      }, 0);
    });

    resizeObserver.current.observe(chartContainerRef.current);

    return () => resizeObserver.current?.disconnect();
  }, []);

  return (
    <div>
      
      <div
        ref={chartContainerRef}
        className="chart-container"
      />
    </div>
  );
}
