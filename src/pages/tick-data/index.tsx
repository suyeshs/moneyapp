import React, { useEffect, useState } from 'react';
import { GridComponent, ColumnDirective } from '../../app/components/DataGrid/DataGridComponenet'; // update path to actual location
import { CombinedStockData, StockData } from '../../types';
import useFeedWorker from '../../hooks/useFeedWorker'

const columnData = [
  { field: "Call.security_id", headerText: "Call Security ID", textAlign: "center" as const },
  { field: "Call.ltp", headerText: "Call LTP", textAlign: "center" as const },
  { field: "Call.openInterest", headerText: "Call Open Interest", textAlign: "right" as const },
  { field: "Call.volume", headerText: "Call Volume", textAlign: "right" as const },
  { field: "Call.lastTradedPrice", headerText: "Call Last Traded Price", textAlign: "right" as const },
  { field: "strikePrice", headerText: "Strike Price", textAlign: "center" as const },

  { field: "Put.security_id", headerText: "Put Security ID", textAlign: "center" as const },
  { field: "Put.ltp", headerText: "Put LTP", textAlign: "center" as const },
  { field: "Put.openInterest", headerText: "Put Open Interest", textAlign: "right" as const },
  { field: "Put.volume", headerText: "Put Volume", textAlign: "right" as const },
  { field: "Put.lastTradedPrice", headerText: "Put Last Traded Price", textAlign: "right" as const },

  // ... add other columns here as needed
];
const StocksPage: React.FC = () => {
  const [dataMap, setDataMap] = useState<Record<number, CombinedStockData>>({});
  const { dataFromWorker } = useFeedWorker();
  
  useEffect(() => {
    if (dataFromWorker) {
      setDataMap(prevDataMap => {
        const updatedDataMap = { ...prevDataMap };

        dataFromWorker.forEach((item: StockData) => {
          const { strikePrice, OptionType } = item;
          if (!updatedDataMap[strikePrice]) {
            updatedDataMap[strikePrice] = { strikePrice: strikePrice } as CombinedStockData;
          }
          if (OptionType in updatedDataMap[strikePrice]) {
            updatedDataMap[strikePrice][OptionType] = item;
          }
        });
        console.log('Updated data map:', updatedDataMap);
        return updatedDataMap;
      });
      
    }
  }, [dataFromWorker]);

  
  const gridData = Object.values(dataMap);
  console.log('Data for GridComponent:', gridData);
  return (
    <div>
      <h1>Real-Time Stock Data</h1>
      <GridComponent
        dataSource={gridData}
        enableHover={false}
        allowSelection={false}
        enableStickyHeader={true}
        cssClass="sticky-header-grid"
      >
        {columnData.map((column, index) => (
          <ColumnDirective
            key={index}
            field={column.field}
            headerText={column.headerText}
            headerTextAlign={column.textAlign}
          />
        ))}
      </GridComponent>
    </div>
  );
};

export default StocksPage;
