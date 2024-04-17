import { useEffect, useRef, useState } from "react";
import DataTable from "../../app/components/DataGrid/ReactTable";
import { useWebSocketMobX } from "../../hooks/useSocketMobx";
import { GetServerSideProps } from "next";
import { fetchHistoricalData } from "../../app/lib/mongodb"; // Adjust the import path as necessary
import PriceVolumeChart from "../../app/components/Charts/PriceVolumeChart";
import HistoricalChart from "../../app/components/Charts/HistoricalChart";
import { AggregatedData} from "../../app/utils/dataAggregation";
import {paytmSocketStore} from "../../stores/PaytmSocketStore";
import { Observer  } from "mobx-react-lite"; // Import useObserver for MobX
import { autorun } from "mobx"; // Import autorun from MobX

// Define the props interface with chartData property
interface HomeProps {
  chartData: AggregatedData[]; // Assuming AggregatedData is the correct type for chartData
}


const Home: React.FC<HomeProps> = ({ chartData }) => {
  

  useEffect(() => {
    const disposer = autorun(() => {
      if (paytmSocketStore.isInitialLoadCompleted) {
        // Perform any action when isInitialLoadCompleted becomes true
       
      }
    });

    return () => disposer();
  }, []);

  return (
    

    <Observer>
      {() => (
        <div>
          
            <div >
              <DataTable />
            </div>
          
          <div >
            {/* Render any other components you need */}
            <PriceVolumeChart chartData={chartData as AggregatedData[]} /> {/* Cast chartData to the correct type */}
           
          </div>
        </div>
      )}
    </Observer>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps<HomeProps> = async (
  context
) => {
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

  return {
    props: {
      chartData,
    },
  };
};

