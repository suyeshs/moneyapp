
import { useEffect, useRef, useState } from "react";
import { debounce } from "lodash";
import { OptionData } from "../types";
import { paytmSocketStore } from "../stores/PaytmSocketStore";

// Initialize the worker outside of the hook if it does not depend on props or state
const worker = new Worker("./webWorker.js");

export const useFeedWorker = () => {
  const [dataMap, setDataMap] = useState<Map<number, OptionData>>(new Map());
  const [bufferedData, setBufferedData] = useState<OptionData[]>([]);

  // Debounce function to batch updates
  const updateDataMap = debounce((newData: OptionData[]) => {
    setDataMap((prevDataMap) => {
      const updatedDataMap = new Map(prevDataMap);
      newData.forEach((data) => {
        updatedDataMap.set(data.strikePrice, data);
      });
      const data = Array.from(updatedDataMap.values());
      paytmSocketStore.setData(data);
      return updatedDataMap;
    });
  }, 500);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "WEBSOCKET_DATA_INCOMING") {
        const incomingData: OptionData = event.data.data;
        setBufferedData((prevData) => [...prevData, incomingData]);
      }
    };

    worker.addEventListener('message', handleMessage);
    worker.postMessage({ type: "START_WEBSOCKET_CONNECTION" });

    return () => {
      updateDataMap.cancel(); // Cancel any pending updates
      worker.removeEventListener('message', handleMessage);
      // Do not terminate the worker here if it's shared across the app
    };
  }, [updateDataMap]);

  useEffect(() => {
    if (bufferedData.length > 0) {
      updateDataMap(bufferedData);
      setBufferedData([]);
    }
  }, [bufferedData,updateDataMap]);

  return { data: paytmSocketStore.data };
};

export default useFeedWorker;
