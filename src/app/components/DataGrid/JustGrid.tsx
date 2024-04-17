// YourGridComponent.tsx
import React, {  useState, useRef,useEffect } from "react";
import { observer } from 'mobx-react';
import { GridComponent, ColumnsDirective, ColumnDirective } from '@syncfusion/ej2-react-grids';
import { paytmSocketStore } from '../../../stores/PaytmSocketStore';
import styles from "./syncoptions.module.css";





const OptionsGrid= observer(() => {
 console.log('OptionsGrid rendering...');
 
  const [closestStrikePrice] = useState<number>(0);

  const gridData = paytmSocketStore.data;

  const [atmStrikePrice, setAtmStrikePrice] = useState<number | null>(null);
  const [atmIndex, setAtmIndex] = useState<number | null>(null);

  const [selectedRange, setSelectedRange] = useState<number | "5">("5"); // Set initial value to 'All'

  function roundToNearest50(value: number): number {
    return Math.round(value / 50) * 50;
  }
  
 
  useEffect(() => {
    if (gridData.length > 0) {
      const underlyingValue = gridData[0]?.underlyingValue;
      if (underlyingValue !== undefined) {
        const roundedValue = roundToNearest50(underlyingValue);
        const index = gridData.findIndex(item => item.strikePrice === roundedValue);
        setAtmStrikePrice(index !== -1 ? gridData[index].strikePrice : null);
        setAtmIndex(index);
      }
    }
  }, [gridData]);

  console.log("Grid Data:", gridData);
  console.log("ATM Strike Price:", atmStrikePrice);
  console.log("ATM Index:", atmIndex);

  console.log(atmIndex);
  const getRelativeAtmIndex = () => {
    // Check if atmIndex is not null
    if (atmIndex !== null) {
      if (selectedRange === "5") {
        return atmIndex;
      }
      const start = Math.max(atmIndex - selectedRange, 0);
      return atmIndex - start; // Relative index in the sliced data
    } else {
      // Handle the case where atmIndex is null
      return null; // or return a default value like 0 or -1 depending on your logic
    }
  };
  
    
    
  
    // rowDataBound event handler
    const rowDataBound = (args: any) => {
      if (args.data.strikePrice === closestStrikePrice) {
        args.row.style.background = 'beige';
    
        // Find the Strike Price cell and apply custom styling
        const strikePriceCell = args.row.querySelector('[aria-colindex="5"]');
        if (strikePriceCell) {
          strikePriceCell.style.fontWeight = "bold";
          strikePriceCell.style.fontSize = "13";
          strikePriceCell.style.color = "#090909";
          strikePriceCell.style.padding = "10px"; // Increase cell size
          strikePriceCell.style.boxShadow = "5px 0 5px -2px #888, -5px 0 5px -2px #888"; // Add a shadow
        }
      }
    };
  
    // queryCellInfo event handler
    const queryCellInfo = (args: any) => {
      // Array of the names of the columns for which you want to change the cell color
      const ceColumns = ["CE_OI", "CE_VOLUME", "CE_IV", "CE_PREMIUM"];
      const peColumns = ["PE_OI", "PE_VOLUME", "PE_IV", "PE_PREMIUM"];
      const relativeAtmIndex = getRelativeAtmIndex();
  
    
      // Assuming 'atmIndex' is calculated elsewhere in your component
      // This should be the index of the ATM row in the current view (sliced data)
    
      if (args.cell.parentElement && relativeAtmIndex !== null) {
        const rowIndex = Number(args.cell.parentElement.getAttribute("aria-rowindex"));
    
        // Highlight Call cells above ATM Index
        if (ceColumns.includes(args.column.field) && rowIndex < relativeAtmIndex +1) {
          args.cell.style.background = "lightgrey";
        }
    
        // Highlight Put cells below ATM Index
        if (peColumns.includes(args.column.field) && rowIndex > relativeAtmIndex +1) {
          args.cell.style.background = "lightgrey";
        }
      }
    
      // Additional cell styling
      if (args.column.field === "strikePrice") {
        args.cell.style.backgroundColor = "#C9C8C8";
      }
      args.cell.style.textAlign = "center";
    };
    
    
  
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
                ? Math.abs(rowData[`${type}_totalTradedVolume`])
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
  
  
      // const oi = isDividedByLotSize && lot_size && lot_size !== 0 ? rowData['CE_openInterest'] / lot_size : rowData['CE_openInterest'];
      //const changeInOI = isDividedByLotSize && lot_size && lot_size !== 0 ? rowData['CE_changeinOpenInterest'] / lot_size : rowData['CE_changeinOpenInterest'];
      const ce_oi =
      rowData["CE_openInterest"] && isFinite(rowData["CE_openInterest"])
        ? Math.abs(rowData["CE_openInterest"])
        : 0; // or some other default value or handling
    
    const CE_changeInOI =
      Math.abs(rowData["CE_changeinOpenInterest"] || 0);
    const maxSize = 200000; // Adjust this value as needed
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
        ? Math.abs(rowData["PE_openInterest"])
        : 0; // or some other default value or handling
    
    const PE_changeInOI =
      Math.abs(rowData["PE_changeinOpenInterest"] || 0);
    const maxSize = 200000; // Adjust this value as needed
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
  
    
   
  
 
  
    
  
    
  
    
         
  
   
  
    
  
        //console.log("GridsData before return",gridData)
    return (
      <div className={"{styles.flexContainer}fluent-dark"}>
        
          <div>
            
        
            <div>
              <GridComponent
                dataSource={gridData}
                 // Replace 'uniqueIdentifier' with your data's unique field
                enableImmutableMode={true} // Enable immutable mode
  
                rowDataBound={rowDataBound}
                enableVirtualization = {false}
                enableHover={false}
                allowSelection={false}
                enableStickyHeader={true}
                cssClass="sticky-header-grid"
                
                queryCellInfo={queryCellInfo}
              >
                <ColumnsDirective>
                  <ColumnDirective
                    field="CE_OI"
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
            </div>
        
            </div>
        
      </div>
    );
                      
  });
  
  export default (OptionsGrid);
