import { useEffect, useRef, useState,useMemo } from "react";
import { OptionData } from "../types";
import { paytmSocketStore } from "../stores/PaytmSocketStore";

export const useFeedWorker = () => {
  const workerRef = useRef<Worker | null>(null);
  const [dataMap, setDataMap] = useState<Map<number, OptionData>>(new Map());

  useEffect(() => {
    workerRef.current = new Worker("./webWorker.js")
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
            ? { ...existingData, ...extractCallData(incomingData) }
            : { ...existingData, ...extractPutData(incomingData) };

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
