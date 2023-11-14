import React, { useEffect, useState, useRef } from "react";
import { observer } from "mobx-react-lite";
import { OptionDataRow } from "../../types";
import { GridComponent, ColumnDirective } from "../../app/components/DataGrid/DataGridComponenet";
import { paytmSocketStore } from "../../stores/PaytmSocketStore";
import styles from "./syncoptions.module.css";
import { DropDownListComponent, MultiSelectComponent } from "@syncfusion/ej2-react-dropdowns";
import tradepodSocket from "../../hooks/tradepodSocket"; // Assuming you have a hook named useTradepodSocket

const OptionsGrid = observer(() => {
  const [atmIndex, setAtmIndex] = useState(-1); // Initialize atmIndex with -1
  const [selectedRange, setSelectedRange] = useState<number>(10); // Set initial value to 10
  const [isDividedByLotSize, setIsDividedByLotSize] = useState(false);
  const [isFetchingExpiryDates, setIsFetchingExpiryDates] = useState(false);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Use the custom hook to manage WebSocket connection
  const { isConnected, sendMessage } = tradepodSocket('ws://127.0.0.1:8888/tradepod');

  // Access store data and loading state
  const { data, isLoading } = paytmSocketStore;

  // Effect for setting atmIndex based on data
  useEffect(() => {
    if (data && data.length > 0) {
      const newAtmIndex = data.findIndex(item => item.StrikeATM === true);
      if (newAtmIndex !== -1 && newAtmIndex !== atmIndex) {
        setAtmIndex(newAtmIndex); // Update the atmIndex state only here
      }
    }
  }, [data, atmIndex]);

  // Effect to handle loading state
  useEffect(() => {
    setIsFetchingExpiryDates(isLoading);
  }, [isLoading]);

  // Example function to send a message
  const handleSendMessage = () => {
    const message = { type: "REQUEST_DATA", payload: {/* ... */} };
    sendMessage(message);
  };


  

  
 

  
  
  

  

 // Example function that uses OptionDataRow type
const rowDataBound = (data: any) => {
  // You will need to ensure that 'data' has the correct structure
  const optionData = data as OptionDataRow; // Cast 'data' to 'OptionDataRow'
  const rowIndex = optionData.rowIndex;
  
  // You'll need to make sure 'selectedRange' and 'atmIndex' are available in this scope
  const selectedRangeNumber = Number(selectedRange); // selectedRange should be a state or prop
  const atmIndex = setAtmIndex; // someAtmIndex should be the current ATM index

  if (typeof atmIndex === "number") {
    if (
      rowIndex >= atmIndex - selectedRangeNumber &&
      rowIndex <= atmIndex + selectedRangeNumber
    ) {
      // Return true if the row is within the range, indicating it is special
      return true;
    }
  }
  // Return false if the row is not special
  return false;
};


 
 
  useEffect(() => {
    const gridContainer = gridContainerRef.current;
  
    if (gridContainer) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.addedNodes.length) {
          console.log("Mutation:", mutation);  
          }
        });
      });
  
      observer.observe(gridContainer, {
        childList: true, // observe direct children
        subtree: true, // and lower descendants too
      });
  
      // Disconnect the observer on cleanup
      return () => observer.disconnect();
    }
  }, []);
  

 


  //console.log("ATM Index at scroll:", atmIndex);




  

  
      
      
      
      

      
      
      // Later in your code, when you call calculateFairPrice, make sure atmIndex is set.
      // const fairPrice = calculateFairPrice(data, atmIndex); // atmIndex should be the actual ATM index value
      



  function RangeSelector() {
    return (
      <div className={styles.stylebox}>
        {[3, 5, 10, "All"].map((num) => (
          <div
            key={num}
            className={`${styles.box} ${
              selectedRange === num ? styles.selectedBox : ""
            }`}
            onClick={() => setSelectedRange(num as number | 10)}
          >
            {num}
          </div>
        ))}
      </div>
    );
  }



  return (
    
    
    <div>
      <div className={styles.container}>
              {/* Instrument Card */}
              <div className={styles.eCard} id="basic">
              </div>
  
              {/* Fair Price Card */}
              <div className={styles.eCard} id="fairPrice">
                
                <p>ATM Strike Price index: {atmIndex}</p>
              </div>

              {/* PCR */}
              <div className={styles.eCardPCR} id="putCallRatio">
                <div className={styles.label}>PCR:</div>
                <div className={styles.value}>{}</div>
              </div>

              {/* Toggle for Lot Size */}
              <div
                className={`${styles.eCardToggleLot} radio-inline`}
                id="lot_size_radio"
              >
                <input
                  type="radio"
                  id="fullOI"
                  name="displayMode"
                  checked={!isDividedByLotSize}
                  onChange={() => setIsDividedByLotSize(false)}
                />
                <label className={styles.button} htmlFor="fullOI">
                  ALL
                </label>

                <input
                  type="radio"
                  id="dividedOI"
                  name="displayMode"
                  checked={isDividedByLotSize}
                  onChange={() => setIsDividedByLotSize(true)}
                />
                <label className={styles.button} htmlFor="dividedOI">
                  BY LOT
                </label>
              </div>

              {/* Lot Size Card */}
              <div className={styles.eCardLot} id="lot_size">
              </div>

              <div className={styles.stylebox}>
                {" "}
                {/* This is the new div for selecting range */}
                {[3, 5, 10, "All"].map((num) => (
                  <div
                    key={num}
                    className={`${styles.box} ${
                      selectedRange === num ? styles.selectedBox : ""
                    }`}
                    onClick={() => setSelectedRange(num as number | 10)} // Explicitly cast num
                  >
                    {num}
                  </div>
                ))}
              </div>

              <div>
  
                
              </div>
            </div>
      
     

          :  {atmIndex !== -1 &&(
        <GridComponent 
        dataSource={data}
        rowDataBound={rowDataBound}
        enableHover={true}>
          {/* Call Options Section */}
          <ColumnDirective field="CE_security_id" headerText="Security ID" />
          <ColumnDirective
            headerText="Open Interest"
            template={(rowData: OptionDataRow) => (
              <div>
                <span>
                  {typeof rowData.CE_openInterest === "number"
                    ? rowData.CE_openInterest
                    : 0}
                </span>
                <span>
                  {" "}
                  (
                  {typeof rowData.CE_changeinOpenInterest === "number"
                    ? rowData.CE_changeinOpenInterest
                    : 0}
                  )
                </span>
                <div>
                  Vega:{" "}
                  {typeof rowData.CE_vega === "number"
                    ? rowData.CE_vega.toFixed(2)
                    : "0.00"}
                </div>
              </div>
            )}
          />

          <ColumnDirective
            field="CE_lastPrice"
            headerText="Last Price"
            template={(rowData: OptionDataRow) => (
              <div>
                <span>
                  {typeof rowData.CE_lastPrice === "number"
                    ? rowData.CE_lastPrice
                    : 0}
                </span>

                <div>
                  Delta:{" "}
                  {typeof rowData.CE_delta === "number" ? rowData.CE_delta : 0}
                </div>
              </div>
            )}
          />
          <ColumnDirective
            field="CE_totalTradedVolume"
            headerText="Volume"
            template={(rowData: OptionDataRow) => (
              <div>
                <span>
                  {typeof rowData.CE_totalTradedVolume === "number"
                    ? rowData.CE_totalTradedVolume
                    : 0}
                </span>

                <div>
                  Gamma:{" "}
                  {typeof rowData.CE_gamma === "number" ? rowData.CE_gamma : 0}
                </div>
              </div>
            )}
          />
          <ColumnDirective
            field="CE_impliedVolatility"
            headerText="Implied Volatility"
            template={(rowData: OptionDataRow) => (
              <div>
                <span>
                  {typeof rowData.CE_impliedVolatility === "number"
                    ? rowData.CE_impliedVolatility
                    : 0}
                </span>

                <div>
                  Theta:{" "}
                  {typeof rowData.CE_theta === "number" ? rowData.CE_theta : 0}
                </div>
              </div>
            )}
          />

          {/* Strike Price Section */}
          <ColumnDirective field="strikePrice" headerText="Strike Price" />

          {/* Put Options Section */}
          <ColumnDirective field="PE_security_id" headerText="Security ID" />
          <ColumnDirective
            field="PE_openInterest"
            headerText="Open Interest"
            template={(rowData: OptionDataRow) => (
              <div>
                <span>
                  {typeof rowData.PE_openInterest === "number"
                    ? rowData.PE_openInterest
                    : 0}
                </span>
                <span>
                  {" "}
                  (
                  {typeof rowData.PE_changeinOpenInterest === "number"
                    ? rowData.PE_changeinOpenInterest
                    : 0}
                  )
                </span>
                <div>
                  Vega:{" "}
                  {typeof rowData.PE_vega === "number"
                    ? rowData.PE_vega.toFixed(2)
                    : "0.00"}
                </div>
              </div>
            )}
          />
          <ColumnDirective
            field="PE_changeinOpenInterest"
            headerText="Change in OI"
          />
          <ColumnDirective
            field="PE_lastPrice"
            headerText="Last Price"
            template={(rowData: OptionDataRow) => (
              <div>
                <span>
                  {typeof rowData.PE_lastPrice === "number"
                    ? rowData.PE_lastPrice
                    : 0}
                </span>

                <div>
                  Delta:{" "}
                  {typeof rowData.PE_delta === "number" ? rowData.PE_delta : 0}
                </div>
              </div>
            )}
          />
          <ColumnDirective
            field="PE_totalTradedVolume"
            headerText="Total Traded Volume"
            template={(rowData: OptionDataRow) => (
              <div>
                <span>
                  {typeof rowData.PE_totalTradedVolume === "number"
                    ? rowData.PE_totalTradedVolume
                    : 0}
                </span>

                <div>
                  Gamma:{" "}
                  {typeof rowData.PE_gamma === "number" ? rowData.PE_gamma : 0}
                </div>
              </div>
            )}
          />
          <ColumnDirective
            field="PE_impliedVolatility"
            headerText="Implied Volatility"
            template={(rowData: OptionDataRow) => (
              <div>
                <span>
                  {typeof rowData.PE_impliedVolatility === "number"
                    ? rowData.PE_impliedVolatility
                    : 0}
                </span>

                <div>
                  Theta:{" "}
                  {typeof rowData.PE_theta === "number" ? rowData.PE_theta : 0}
                </div>
              </div>
            )}
          />
        </GridComponent>
      )}
    </div>
  );
});

export default OptionsGrid;
