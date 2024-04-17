import { useEffect, useState } from "react";
import { fetchHistoricalData } from "../../../app/lib/mongodb";
import { AggregatedData } from "../../../app/utils/dataAggregation";
import PriceVolumeChart from "./PriceVolumeChart";

const GraphComponent: React.FC = () => {
  const [chartData, setChartData] = useState<AggregatedData[]>([]);
  const specificStrikePrice = 21000; // Default value for specific strike price

  useEffect(() => {
    const fetchData = async () => {
      try {
        const startDate = new Date("2023-09-30T18:30:00.000");
        const endDate = new Date("2023-11-26T00:00:00.000");
        const data = await fetchHistoricalData(specificStrikePrice, startDate, endDate);
        console.log("Data:", data);
        setChartData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [specificStrikePrice]);

  return (
    <div>
    </div>
  );
};

export default GraphComponent;
