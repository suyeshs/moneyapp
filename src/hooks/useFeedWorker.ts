import { useEffect, useRef, useState } from "react";
import { OptionData } from "../types";
import { paytmSocketStore } from "../stores/PaytmSocketStore"; 

export const useFeedWorker = () => {
  const worker = useRef<Worker | null>(null);
  const [dataMap, setDataMap] = useState(() => new Map());


  useEffect(() => {

    
    try {
      worker.current = new Worker("/webWorker.js");
      console.log("Web worker initialized.");
    } catch (error) {
      console.error("Failed to initialize web worker:", error);
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "WEBSOCKET_DATA_INCOMING") {
        const incomingData: OptionData = event.data.data;
        const strikePrice = incomingData.strikePrice;
        //console.log("Data received from web worker:", incomingData);

        setDataMap((prevDataMap) => {
          const updatedDataMap = new Map(prevDataMap);
          const strikePrice = incomingData.strikePrice;

          const existingData = updatedDataMap.get(strikePrice) || {};
          const updatedData = { ...existingData, ...incomingData };
          updatedDataMap.set(strikePrice, updatedData);

          const data = Array.from(updatedDataMap.values());
          paytmSocketStore.setData(data);

          return updatedDataMap;
        });
      } else {
        console.warn("Unhandled message from worker:", event.data);
      }
    };

    if (worker.current) {
      worker.current.onmessage = handleMessage;
      worker.current.postMessage({ type: "START_WEBSOCKET_CONNECTION" });
    }

    return () => {
      if (worker.current) {
        worker.current.terminate();
        console.log("Web worker terminated.");
      }
    };
  }, []);

  useEffect(() => {
    const data = Array.from(dataMap.values());
    paytmSocketStore.setData(data);
  }, [dataMap]);

  return { data: paytmSocketStore.data };
};

export default useFeedWorker;
