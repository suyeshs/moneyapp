import React, { useEffect, useState, useRef } from "react";
import { observer } from "mobx-react-lite";
import useFeedWorker from "../../hooks/useFeedWorker"; // Adjust the import path as necessary
import { OptionDataRow } from "../../types";
import {
  GridComponent,
  ColumnDirective,
} from "../../app/components/DataGrid/DataGridComponenet";
import { paytmSocketStore } from "../../stores/PaytmSocketStore";
import styles from "./syncoptions.module.css";

import {
  DropDownListComponent,
  MultiSelectComponent,
} from "@syncfusion/ej2-react-dropdowns";


const YourComponent = observer(
  ({
    initialData,
    initialStock,
  }: {
    initialData: OptionDataRow[];
    initialStock: string;
  }) => {
    const [atmIndex, setAtmIndex] = useState(0); // Initialize atmIndex with -1
    const [selectedRange, setSelectedRange] = useState<number | 10>(10); // Set initial value to '10'
    const [isDividedByLotSize, setIsDividedByLotSize] = useState(false);
   

    const [isFetchingExpiryDates, setIsFetchingExpiryDates] = useState(false);
    const gridContainerRef = useRef<HTMLDivElement>(null);


  // Since we're using MobX, it will automatically subscribe to the relevant observables
  // and re-render the component when they change.
  useFeedWorker();

  const { data } = paytmSocketStore;
  //console.log(data);

  



 // Effect for setting atmIndex based on data
  useEffect(() => {
    if (data && data.length > 0) {
      const newAtmIndex = data.findIndex(item => item.StrikeATM === true);
      if (newAtmIndex !== -1 && newAtmIndex !== atmIndex) {
        setAtmIndex(newAtmIndex); // Update the atmIndex state only here
      }
      if (paytmSocketStore.isLoading) {
        paytmSocketStore.setLoading(false);
      }
    }
  }, [data]);

  

  
  const [userSelectedStock, setUserSelectedStock] = useState(
    initialStock || ""
  );

  

  

 

  
  
  const startSliceIndex =
    selectedRange === 10
      ? 0 // When 'All' is selected, start from the beginning
      : Math.max(atmIndex - selectedRange, 0);
  //console.log("Start Slice Index:", startSliceIndex);
  const displayData =
    paytmSocketStore.data && selectedRange !== 10 // Check if 'All' is selected
      ? paytmSocketStore.data.slice(
          startSliceIndex,
          atmIndex + selectedRange + 1
        )
      : paytmSocketStore.data || []; // Use the entire data array when 'All' is selected
  const totalCE_openInterest = displayData.reduce(
    (total, row) => total + (row.CE_openInterest || 0),
    0
  );
  const totalCE_totalTradedVolume = displayData.reduce(
    (total, row) => total + (row.CE_totalTradedVolume || 0),
    0
  );
  const totalPE_openInterest = displayData.reduce(
    (total, row) => total + (row.PE_openInterest || 0),
    0
  );
  const totalPE_totalTradedVolume = displayData.reduce(
    (total, row) => total + (row.PE_totalTradedVolume || 0),
    0
  );

  

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
  console.log('Data before finding ATM Index:', data);
  if (atmIndex !== -1) return;

  // Find the index of the row with StrikeATM as true
  const newAtmIndex = data.findIndex(item => item.StrikeATM === true);
  console.log("New ATM Index:", newAtmIndex);
  // If the ATM index is found, proceed to apply the styling and scroll to the row

  
  if (newAtmIndex !== -1 && gridContainerRef.current) {
    // Scroll to the ATM row
    const rows = gridContainerRef.current.getElementsByTagName("tr");
    let scrollHeight = 0;
    for (let i = 0; i < newAtmIndex; i++) {
      scrollHeight += rows[i].clientHeight;
    }
    const centerPosition = scrollHeight - gridContainerRef.current.clientHeight / 2 + rows[newAtmIndex].clientHeight / 2;
    gridContainerRef.current.scrollTo({
      top: centerPosition,
      behavior: "smooth",
    });
    console.log(`Scrolling to ATM row ${newAtmIndex}`);
    // Apply styling to the ATM row
    useEffect(() => {
      // Only proceed if newAtmIndex is not 0 and rows are available
      if (newAtmIndex !== 0 && rows.length > newAtmIndex) {
        const atmRow = rows[newAtmIndex];
        // Add a class to highlight the row in red
        atmRow.classList.add('highlight-red');
        const strikePriceCell = atmRow.querySelector('[aria-colindex="5"]');
        if (strikePriceCell) {
          strikePriceCell.classList.add('your-custom-strikeprice-styling');
        }
      }
    }, [newAtmIndex, rows]); // Depend on newAtmIndex and rows to re-run this effect
    // Update local atmIndex state with the found index if it has changed
    if (atmIndex !== newAtmIndex) {
      setAtmIndex(newAtmIndex);
    }
  }
}, [data]); // Depend on the data from the store

 
 
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




  
  const lotSize = paytmSocketStore.lot_size;

  const putCallRatio =
    totalCE_openInterest !== 0
      ? (totalPE_openInterest / totalCE_openInterest).toFixed(2)
      : 0; // Default to 0 if total call open interest is 0 to avoid division by zero

  
  function Instrument() {
    // Use a fallback value or some loading state until the actual value is fetched
    const underlyingValue = data[0].CE_underlyingValue;
    console.log("Underlying Value:", underlyingValue);
    return <div>Nifty: {underlyingValue}</div>;
  }
      
      

      const calculateFairPrice = (data: any[], atmIndex: number) => {
        // Ensure ATMIndex is set and data is available

        if (atmIndex > 0 && data && data.length > 0) {
          // Find the row with the ATM strike price
          const atmData = data.find((row: any) => row.strikePrice === atmIndex);
          console.log ("Calculate",atmData)
          if (atmData) {
            // Extract CE and PE last prices
            const ceLastPrice = atmData.CE_lastPrice || 0;
            const peLastPrice = atmData.PE_lastPrice || 0;
      
            // Calculate the fair price
            const fairPrice = atmIndex + ceLastPrice - peLastPrice;
            return fairPrice;
          } else {
            // Handle the case where the ATM data row is not found
            console.log(`No data found for ATM strike price: ${atmIndex}`);
            return null; // or some other default value
          }
        } else {
          // Handle the case where ATMIndex is not set or data is not available
          console.log('ATMIndex is not set or data is not available.');
          return null; // or some other default value
        }
      };
      
      // Later in your code, when you call calculateFairPrice, make sure atmIndex is set.
      // const fairPrice = calculateFairPrice(data, atmIndex); // atmIndex should be the actual ATM index value
      

function FairPriceCard() {
  // Assuming paytmSocketStore is defined and accessible in this scope
  const fairPrice = calculateFairPrice(data, atmIndex);

  // Check if fairPrice is a number before calling toFixed
  const displayPrice = typeof fairPrice === 'number' ? fairPrice.toFixed(2) : 'N/A';

  return <div>Fair Price: {fairPrice}</div>;
}

  function LotSizeCard() {
    const lot_size = paytmSocketStore.lot_size;
    return (
      <div>
        {lot_size !== null && lot_size !== undefined ? (
          <p>Lot: {lot_size}</p>
        ) : (
          <p>Lot Size is not available</p>
        )}
      </div>
    );
  }

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
                <Instrument />
              </div>

              {/* Fair Price Card */}
              <div className={styles.eCard} id="fairPrice">
                <FairPriceCard />
                <p>ATM Strike Price index: {atmIndex}</p>
              </div>

              {/* PCR */}
              <div className={styles.eCardPCR} id="putCallRatio">
                <div className={styles.label}>PCR:</div>
                <div className={styles.value}>{putCallRatio}</div>
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
                <LotSizeCard />
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
  <DropDownListComponent
    placeholder="Select Expiry Dates"
   
  />
</div>
              <div>
                {isFetchingExpiryDates ? (
                  <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Loading expiry dates, please wait...</p>
                  </div>
                ) : (
                  <DropDownListComponent
                    placeholder="Select Instrument"
                   
                  />
                )}
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

export default YourComponent;
