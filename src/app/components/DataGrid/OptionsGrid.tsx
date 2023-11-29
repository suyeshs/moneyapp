import React, { useRef, useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import { GridComponent, ColumnsDirective, ColumnDirective } from '@syncfusion/ej2-react-grids';
import '@syncfusion/ej2-react-grids/styles/material.css';
import { useStore } from '../../../stores/StoreProvider';
import { OptionData } from '../../../types';
import styles from './syncoptions.module.css';
import { paytmSocketStore, } from '../../../stores/PaytmSocketStore';

export const OptionsGrid = observer(() => {
  // Directly using the store instance
  const store = paytmSocketStore;
  console.log("SocketStore", store);
  const gridRef = useRef<GridComponent>(null);
  const [isDividedByLotSize, setIsDividedByLotSize] = useState(false);
  const { data } = store; // Accessing data from the store


 
  
  console.log(data)

  const cellTemplate = (
    type: "CE" | "PE",
    property: "Delta" | "Vega" | "Gamma" | "Theta",
    rowData: any
  ) => {
    const formatNumber = (number: number, decimalPlaces: number) => {
      if (number === null) {
        // Handle null value, for example, return a default string or 0
        return 'N/A'; // or return '0'.toFixed(decimalPlaces);
      }
      const roundedNumber = number.toFixed(decimalPlaces);
      const formatter = new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      });
      return formatter.format(parseFloat(roundedNumber));
    };
    
    
    
    switch (property) {
      case "Delta":
        return (
          <div>
            <div className={styles.rowNumbers}>
            {formatNumber(rowData[`${type}_lastPrice`], 2)}
            </div>
            <div className={styles.rowNumbers}>
            Delta: {formatNumber(rowData[`${type}_delta`], 2)}
            </div>
          </div>
        );
      case "Vega":
        return type === "CE" ? ceVega(rowData) : peVega(rowData);

      case "Gamma":
        const lot_size = rowData.lot_size;
        const gammaVolume =
          rowData[`${type}_totalTradedVolume`] &&
          isFinite(rowData[`${type}_totalTradedVolume`])
            ? isDividedByLotSize && lot_size && lot_size !== 0
              ? Math.abs(rowData[`${type}_totalTradedVolume`] / lot_size)
              : rowData[`${type}_totalTradedVolume`]
            : "N/A"; // Or any other fallback or default value

        return (
          <div>
            <div className={styles.rowNumbers}>
              {gammaVolume !== "N/A" ? gammaVolume.toLocaleString() : "N/A"}
            </div>
            <div className={styles.greekNumbers}>
            Gamma: {formatNumber(rowData[`${type}_gamma`], 4)}
            </div>
          </div>
        );

      case "Theta":
        return (
          <div>
            <div className={styles.rowNumbers}>
              {rowData[`${type}_impliedVolatility`]}
            </div>
            <div className={styles.greekNumbers}>
            Theta: {formatNumber(rowData[`${type}_theta`], 2)}
            </div>
          </div>
        );
    }
  };

  const ceVega = (rowData: any) => {
    const color = rowData["CE_changeinOpenInterest"] > 0 ? "green" : "green";
    //const changeInOI = Math.abs(rowData['CE_changeinOpenInterest']);

    const lot_size = rowData.lot_size;

    // const oi = isDividedByLotSize && lot_size && lot_size !== 0 ? rowData['CE_openInterest'] / lot_size : rowData['CE_openInterest'];
    //const changeInOI = isDividedByLotSize && lot_size && lot_size !== 0 ? rowData['CE_changeinOpenInterest'] / lot_size : rowData['CE_changeinOpenInterest'];
    const ce_oi =
      rowData["CE_openInterest"] && isFinite(rowData["CE_openInterest"])
        ? isDividedByLotSize && lot_size && lot_size !== 0
          ? Math.abs(rowData["CE_openInterest"] / lot_size)
          : rowData["CE_openInterest"]
        : 0; // or some other default value or handling

    const CE_changeInOI =
      isDividedByLotSize && lot_size && lot_size !== 0
        ? Math.abs((rowData["CE_changeinOpenInterest"] || 0) / lot_size)
        : Math.abs(rowData["CE_changeinOpenInterest"] || 0);
    const maxSize = isDividedByLotSize ? 5000 / (lot_size || 1) : 200000; // Adjust this line
    //const maxSize = 200000; // Adjust this value as needed
    const size = Math.min((CE_changeInOI / maxSize) * 3, 100);
    const progressStyle = {
      backgroundColor: color === "green" ? "#77AE57" : "#ff0000",
      width: `${size}%`,
      height: "18px",
      marginRight: `${100 - size}%`,
      borderRadius: "0px 25px 25px 0px",
    };

    return (
      <div style={{ position: "relative" }}>
        <div className={`${styles.rowNumbers} ${styles.progressBar}`}>
          <div className={styles.progressBarValue} style={progressStyle}></div>
        </div>
        <div
          style={{
            position: "absolute",
            top: "25%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "100%",
            textAlign: "center",
          }}
        >
          {ce_oi.toLocaleString()} ({CE_changeInOI.toLocaleString()})
        </div>
        <div className={styles.greekNumbers}>Vega: {rowData["CE_vega"]}</div>
      </div>
    );
  };

  const peVega = (rowData: any) => {
    const color = rowData["PE_changeinOpenInterest"] > 0 ? "green" : "red";
    const lot_size = rowData.lot_size;

    // const oi = isDividedByLotSize && lot_size && lot_size !== 0 ? rowData['CE_openInterest'] / lot_size : rowData['CE_openInterest'];
    //const changeInOI = isDividedByLotSize && lot_size && lot_size !== 0 ? rowData['CE_changeinOpenInterest'] / lot_size : rowData['CE_changeinOpenInterest'];
    const pe_oi =
      rowData["PE_openInterest"] && isFinite(rowData["PE_openInterest"])
        ? isDividedByLotSize && lot_size && lot_size !== 0
          ? Math.abs(rowData["PE_openInterest"] / lot_size)
          : rowData["PE_openInterest"]
        : 0; // or some other default value or handling

    const PE_changeInOI =
      isDividedByLotSize && lot_size && lot_size !== 0
        ? Math.abs((rowData["PE_changeinOpenInterest"] || 0) / lot_size)
        : Math.abs(rowData["PE_changeinOpenInterest"] || 0);
    const maxSize = isDividedByLotSize ? 5000 / (lot_size || 1) : 200000; // Adjust this line
    const size = Math.min((PE_changeInOI / maxSize) * 3, 100);
    const progressStyle = {
      backgroundColor: color === "green" ? "#77AE57" : "#ff0000",
      width: `${size}%`,
      height: "18px",
      marginRight: `${100 - size}%`,
      borderRadius: "0px 25px 25px 0px",
    };

    return (
      <div style={{ position: "relative" }}>
        <div className={`${styles.rowNumbers} ${styles.progressBar}`}>
          <div className={styles.progressBarValue} style={progressStyle}></div>
        </div>
        <div
          style={{
            position: "absolute",
            top: "25%",
            right: "50%",
            transform: "translate(50%, -50%)",
            width: "100%",
            textAlign: "center",
          }}
        >
          {pe_oi.toLocaleString()} ({PE_changeInOI.toLocaleString()})
        </div>
        <div className={styles.greekNumbers}>Vega: {rowData["PE_vega"]}</div>
      </div>
    );
  };

  const rowDataBound = (args: any) => {
    // Define logic that occurs when a row's data is bound to a template
  };

  const queryCellInfo = (args: any) => {
    // Define logic for each cell's information
  };

  // Replace 'getQuery()' with your actual query logic if needed
  const getQuery = () => {
    // Define your query logic here
    return {}; // Replace with actual query object
  };
  console.log(data)
  return (
    <GridComponent
      dataSource={data}
      rowDataBound={rowDataBound}
      enableVirtualization={false}
      enableHover={false}
      allowSelection={false}
      enableStickyHeader={true}
      cssClass="sticky-header-grid"
      queryCellInfo={queryCellInfo}
    >
       <ColumnsDirective>
                <ColumnDirective
                  field="CE_openInterest"
                  headerText=" OI"
                  template={(rowData: any) =>
                    cellTemplate("CE", "Vega", rowData)
                  }
                  headerTextAlign="Center"
                />
                <ColumnDirective
                  field="CE_VOLUME"
                  headerText="VOLUME"
                  template={(rowData: any) =>
                    cellTemplate("CE", "Gamma", rowData)
                  }
                  headerTextAlign="Center"
                />
                <ColumnDirective
                  field="CE_IV"
                  headerText="IV"
                  template={(rowData: any) =>
                    cellTemplate("CE", "Theta", rowData)
                  }
                  headerTextAlign="Center"
                />
                <ColumnDirective
                  field="CE_PREMIUM"
                  headerText="PREMIUM"
                  template={(rowData: any) =>
                    cellTemplate("CE", "Delta", rowData)
                  }
                  headerTextAlign="Center"
                />

                <ColumnDirective
                  field="strikePrice"
                  headerText="STRIKE PRICE"
                  headerTextAlign="Center"
                />

                <ColumnDirective
                  field="PE_PREMIUM"
                  headerText="PREMIUM"
                  template={(rowData: any) =>
                    cellTemplate("PE", "Delta", rowData)
                  }
                  headerTextAlign="Center"
                />
                
              
                <ColumnDirective
                  field="PE_IV"
                  headerText="IV"
                  template={(rowData: any) =>
                    cellTemplate("PE", "Theta", rowData)
                  }
                  headerTextAlign="Center"
                />
                <ColumnDirective
                  field="PE_VOLUME"
                  headerText="VOLUME"
                  template={(rowData: any) =>
                    cellTemplate("PE", "Gamma", rowData)
                  }
                  headerTextAlign="Center"
                />
                <ColumnDirective
                  field="PE_OI"
                  headerText="OI"
                  template={(rowData: any) =>
                    cellTemplate("PE", "Vega", rowData)
                  }
                  headerTextAlign="Center"
                />
              </ColumnsDirective>
    </GridComponent>
  );
});

export default OptionsGrid;
