import { useEffect, useRef, useState, useMemo } from "react";
import { OptionData } from "../types";
import { paytmSocketStore } from "../stores/PaytmSocketStore";

export const useFeedWorker = () => {
  const workerRef = useRef<Worker | null>(null);
  const [dataMap, setDataMap] = useState<Map<number, OptionData>>(new Map());

  // Define defaultOptionData with default values for all properties of OptionData
const defaultOptionData: OptionData = {
    // Provide default values for all properties of OptionData
    expiryDate: "10-NOV-2023",
    strikePrice: 0,
    underlyingValue: 0,
    StrikeATM: false,
    PE_openInterest: 0,
    PE_changeinOpenInterest: 0,
    PE_totalTradedVolume: 0,
    PE_impliedVolatility: 0,
    PE_lastPrice: 0,
    PE_change: 0,
    PE_pChange: 0,
    PE_calcIV: 0,
    PE_delta: 0,
    PE_gamma: 0,
    PE_theta: 0,
    PE_vega: 0,
    CE_calcIV: 0,
    CE_delta: 0,
    CE_gamma: 0,
    CE_theta: 0,
    CE_vega: 0,
    CE_openInterest: 0,
    CE_changeinOpenInterest: 0,
    CE_totalTradedVolume: 0,
    CE_impliedVolatility: 0,
    CE_lastPrice: 0,
    CE_OI_change: 0,
    CE_OI: 0,
  
  };

  // Define a function to merge data with defaults for undefined properties
  const mergeOptionData = (
    existingData: OptionData | undefined,
    incomingData: Partial<OptionData>
  ): OptionData => {
    return {
      ...defaultOptionData,
      ...existingData,
      ...incomingData,
    };
  };

  useEffect(() => {
    workerRef.current = new Worker("./webWorker.js");
    console.log("Web worker initialized.");

    workerRef.current.onerror = (error: ErrorEvent) => {
      console.error("Web worker error:", error);
    };


    workerRef.current.onmessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === "WEBSOCKET_DATA_INCOMING") {
        setDataMap((prevDataMap) => {
          const updatedDataMap = new Map(prevDataMap);
          const incomingData: OptionData = message.data;
          const strikePrice = incomingData.strikePrice;
          let existingData = updatedDataMap.get(strikePrice);

          // If StrikeATM is true, update the ATM index
          if (incomingData.StrikeATM) {
            const atmIndex = Array.from(updatedDataMap.keys()).indexOf(strikePrice);
            if (atmIndex !== -1) {
              paytmSocketStore.setATMIndex(atmIndex);
            }
          }

          const mergedData = isCallData(incomingData)
            ? mergeOptionData(existingData, extractCallData(incomingData))
            : mergeOptionData(existingData, extractPutData(incomingData));

          updatedDataMap.set(strikePrice, mergedData);
          console.log("Updated data map:", updatedDataMap);
          return updatedDataMap;
        });
      } else {
        console.warn("Unhandled message from worker:", message);
      }
    };

    workerRef.current.postMessage({ type: "START_WEBSOCKET_CONNECTION" });

    return () => {
      workerRef.current?.terminate();
      console.log("Web worker terminated.");
    };
  }, []);

  // Extract Call data
  const extractCallData = (data: OptionData): Partial<OptionData> => {
    const { CE_openInterest, ...rest } = data;
    return rest;
  };

  // Extract Put data
  const extractPutData = (data: OptionData): Partial<OptionData> => {
    const { PE_openInterest, ...rest } = data;
    return rest;
  };

  // Check if the incoming data is for Call
  const isCallData = (data: OptionData): boolean => {
    return 'CE_openInterest' in data;
  };

  // useMemo to convert dataMap to an array only when dataMap changes
  const dataArray = useMemo(() => Array.from(dataMap.values()), [dataMap]);

  // useEffect to trigger updates to the paytmSocketStore when dataArray changes
  useEffect(() => {
    paytmSocketStore.setData(dataArray);
  }, [dataArray]);

  return { data: paytmSocketStore.data };
};

export default useFeedWorker;









