import React, { useEffect, useRef, useState } from "react";
import {
  createChart,
  IChartApi,
  UTCTimestamp,
  ColorType,
  PriceScaleMode,
} from "lightweight-charts";
import fetchChartData from "../../../pages/api/fetchHistorical";

export interface GraphData {
  strike_price: number;
  averagePrice: number;
  close : number;
  volume: number;
  datetime: string;
  right: string;
  high: number;
  low: number;
  open_interest: number;
  pcpr: string;
  pcr: string;

}
interface PriceVolumeChartProps {
  chartData: GraphData[];
}

interface PriceLineProps {
  price: number;
  color: string;
  lineWidth: undefined;
  lineStyle: number; // Adjust the type based on LineStyle enum if available
  axisLabelVisible: boolean;
  title: string;
}

interface colors {
  backgroundColor: string;
  lineColor: string;
  textColor: string;
  areaColor: string;
  areatopColor: string;
}

const HistoricalChart: React.FC<PriceVolumeChartProps> = ({ chartData }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  // Define colors
  const colors: colors = {
    backgroundColor: "#253248",
    lineColor: "teal",
    textColor: "orange",
    areaColor: "blue",
    areatopColor: "red",
  };
  const [backgroundColor, setBackgroundColor] = useState("white");
  const [textColor, setTextColor] = useState("black");

  // Function to convert date string to a timestamp in the format expected by the library
  const toChartTimeFormat = (dateString: string): UTCTimestamp => {
    const date = new Date(dateString);
    //console.log('Date:', date);
    // Convert the date to a Unix timestamp (in seconds)
    const timestamp = Math.floor(date.getTime() / 1000);
    return timestamp as UTCTimestamp; // Cast to UTCTimestamp which is a number
  };

  useEffect(() => {
    if (chartContainerRef.current && !chartRef.current) {
      console.log("Creating chart...");

      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: backgroundColor },
          textColor,
        },
        width: chartContainerRef.current.clientWidth,
        height: 300,
      });
      chartRef.current = chart; // Assign chart to chartRef.current

      chart.timeScale().fitContent();

      const ceData = chartData
        .filter((item) => item.right === "CE")
        .map((item) => ({
          time: toChartTimeFormat(item.datetime),
          value: Number(item.averagePrice),
        }));

      const peData = chartData
        .filter((item) => item.right === "PE")
        .map((item) => ({
          time: toChartTimeFormat(item.datetime),
          value: Number(item.averagePrice),
        }));

      if (ceData.length > 0 && chartRef.current) {
        const ceSeries = chartRef.current.addLineSeries({
          priceScaleId: "",
          color: "teal",
          lineWidth: 2,
          title: "CE",
        });
        ceSeries.setData(ceData);
      }

      if (peData.length > 0) {
        const peSeries = chartRef.current.addLineSeries({
          priceScaleId: "left",
          color: "orange",
          lineWidth: 2,
          title: "PE",
        });
        peSeries.setData(peData);
      }

      // Adding PCPR (Put Call Price Ratio) series
      const pcprData = chartData.map((item) => ({
        time: toChartTimeFormat(item.datetime),

        value: Number(item.pcpr), // Assuming 'pcpr' is the PCPR value in the data
      }));
      //console.log("PCPR Data:", pcprData);
      const uniquePcprData = Array.from(new Set(pcprData.map(value => JSON.stringify(value)))).map(value => JSON.parse(value));      
      //console.log("Unique PCPR Data:", uniquePcprData);
      
      // Sort the pcprData array by time
      const pcprSeries = chartRef.current.addLineSeries({
            priceScaleId: "pcpr", // Unique ID for the PCPR price scale

            color: colors.textColor, // Use chart theme color
            lineWidth: 1,
            title: "PCPR",
                  });
                  pcprData.sort((a, b) => a.time - b.time || a.value - b.value);
                  pcprSeries.setData(uniquePcprData);
                  //console.log("PCPR Data:", pcprData);
                }

        // Adding PCPR (Put Call Price Ratio) series
        const pcrData = chartData.map((item) => ({
          time: toChartTimeFormat(item.datetime),
  
          value: Number(item.pcr), // Assuming 'pcpr' is the PCPR value in the data
        }));
        
        
        
        const uniquePcrData = Array.from(new Set(pcrData.map(value => JSON.stringify(value)))).map(value => JSON.parse(value));      
        //console.log("Unique PCPR Data:", uniquePcrData);

    if (chartRef.current) {
          const pcrSeries = chartRef.current.addLineSeries({
            priceScaleId: "right", // Unique ID for the PCPR price scale
            color: "blue", // Use chart theme color
            lineWidth: 1,
            title: "PCR",
          });
          pcrData.sort((a, b) => a.time - b.time || a.value - b.value);

          pcrSeries.setData(uniquePcrData);

        }
          

        
       

      

    return () => {
      if (chartRef.current) {
        console.log("Removing chart...");
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [chartData]);

  return (
    <div
      ref={chartContainerRef}
      style={{ position: "relative", width: "50%", height: "900px" }}
    />
  );
};

export default HistoricalChart;