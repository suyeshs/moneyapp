// analysis/index.tsx

import { GetServerSideProps } from "next";
import { fetchHistoricalData } from "../../app/lib/mongodb"; // Adjust the import path as necessary
import PriceVolumeChart from "../../app/components/Charts/PriceVolumeChart";
import { AggregatedData, ChartData } from "../../app/utils/dataAggregation";


export const getServerSideProps: GetServerSideProps = async (context) => {
  // Retrieve parameters from context.query or set default values
  const specificStrikePrice = context.query.strikePrice
    ? parseInt(context.query.strikePrice as string)
    : 21000;
  const offsetToIST = 5.5 * 60; // IST is UTC+5:30, converting 5.5 hours to minutes

  const convertToIST = (date: Date) => {
    // Convert date to UTC
    const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    // Then convert UTC date to IST
    return new Date(utcDate.getTime() + offsetToIST * 60000);
  };

  const startDate = context.query.startDate
    ? new Date(context.query.startDate as string)
    : new Date("2023-10-06T00:00:00.000");
  const endDate = context.query.endDate
    ? new Date(context.query.endDate as string)
    : new Date("2024-02-10T00:00:00.000");

  const istStartDate = convertToIST(startDate);
  //console.log(istStartDate)
  const istEndDate = convertToIST(endDate);

  // Use these IST adjusted dates in your MongoDB query
  const query = {
    date: {
      $gte: istStartDate,
      $lte: istEndDate,
    },
  };

  const chartData = await fetchHistoricalData(
    specificStrikePrice,
    istStartDate,
    istEndDate
  );
  //console.log(chartData)
  return {
    props: {
      chartData, // Consistent prop name
    },
  };
};

type AnalysisPageProps = {
  chartData: AggregatedData[];
};


const AnalysisPage: React.FC<AnalysisPageProps> = ({ chartData }) => {
  return (
    <div>
      <div>
        <PriceVolumeChart chartData={chartData} />
      </div>
      
    </div>
  );
};

export default AnalysisPage;
