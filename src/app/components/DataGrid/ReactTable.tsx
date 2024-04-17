// Import necessary dependencies
import React, { useState, useEffect, useCallback, ChangeEvent } from "react";
import { observer } from "mobx-react";
import { paytmSocketStore } from "../../../stores/PaytmSocketStore"; // Adjust the path accordingly
import { initializeExpiryDateStore } from '../../../stores/ExpiryDateStore';
import { autorun } from "mobx";

import { OptionData } from "../../../types"; // Adjust the path accordingly
import StrikePriceRatioTable from "../Ratios/StrikePriceRatioTable";
import WebSocketConnector from "./WebSocketConnector ";
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { useWebSocketMobX } from "../../../hooks/useSocketMobx";

import Spinner from "../../components/spinner";
//import SearchSelect from "../../components/FormComponents/SearchSelect";
import styles from "../../styles/table.module.css";
import {  symbolStore } from "src/stores/SymbolStore";


const symbolData = [
  "BANKNIFTY", "FINNIFTY", "MIDCAPNIFTY", "NIFTY", "AARTIIND", "ABB", "ABBOTINDIA", "ABCAPITAL", "ABFRL", "ACC",
  "ADANIENT", "ADANIPORTS", "ALKEM", "AMBUJACEM", "APOLLOHOSP", "APOLLOTYRE", "ASHOKLEY", "ASIANPAINT", "ASTRAL",
  "ATUL", "AUBANK", "AUROPHARMA", "AXISBANK", "BAJAJ-AUTO", "BAJAJFINSV", "BAJFINANCE", "BALKRISIND", "BALRAMCHIN",
  "BANDHANBNK", "BANKBARODA", "BATAINDIA", "BEL", "BERGEPAINT", "BHARATFORG", "BHARTIARTL", "BHEL", "BIOCON",
  "BOSCHLTD", "BPCL", "BRITANNIA", "BSOFT", "CANBK", "CANFINHOME", "CHAMBLFERT", "CHOLAFIN", "CIPLA", "COALINDIA",
  "COFORGE", "COLPAL", "CONCOR", "COROMANDEL", "CROMPTON", "CUB", "CUMMINSIND", "DABUR", "DALBHARAT", "DEEPAKNTR",
  "DELTACORP", "DIVISLAB", "DIXON", "DLF", "DRREDDY", "EICHERMOT", "ESCORTS", "EXIDEIND", "FEDERALBNK", "GAIL",
  "GLENMARK", "GMRINFRA", "GNFC", "GODREJCP", "GODREJPROP", "GRANULES", "GRASIM", "GUJGASLTD", "HAL", "HAVELLS",
  "HCLTECH", "HDFCAMC", "HDFCBANK", "HDFCLIFE", "HEROMOTOCO", "HINDALCO", "HINDCOPPER", "HINDPETRO", "HINDUNILVR",
  "IBULHSGFIN", "ICICIBANK", "ICICIGI", "ICICIPRULI", "IDEA", "IDFC", "IDFCFIRSTB", "IEX", "IGL", "INDHOTEL",
  "INDIACEM", "INDIAMART", "INDIGO", "INDUSINDBK", "INDUSTOWER", "INFY", "IOC", "IPCALAB", "IRCTC", "ITC",
  "JINDALSTEL", "JKCEMENT", "JSWSTEEL", "JUBLFOOD", "KOTAKBANK", "L&TFH", "LALPATHLAB", "LAURUSLABS", "LICHSGFIN",
  "LT", "LTIM", "LTTS", "LUPIN", "M&M", "M&MFIN", "MANAPPURAM", "MARICO", "MARUTI", "MCDOWELL-N", "MCX",
  "METROPOLIS", "MFSL", "MGL", "MOTHERSON", "MPHASIS", "MRF", "MUTHOOTFIN", "NATIONALUM", "NAUKRI", "NAVINFLUOR",
  "NESTLEIND", "NMDC", "NTPC", "OBEROIRLTY", "OFSS", "ONGC", "PAGEIND", "PEL", "PERSISTENT", "PETRONET", "PFC",
  "PIDILITIND", "PIIND", "PNB", "POLYCAB", "POWERGRID", "PVRINOX", "RAMCOCEM", "RBLBANK", "RECLTD", "RELIANCE",
  "SAIL", "SBICARD", "SBILIFE", "SBIN", "SHREECEM", "SHRIRAMFIN", "SIEMENS", "SRF", "SUNPHARMA", "SUNTV", "SYNGENE",
  "TATACHEM", "TATACOMM", "TATACONSUM", "TATAMOTORS", "TATAPOWER", "TATASTEEL", "TCS", "TECHM", "TITAN", "TORNTPHARM",
  "TRENT", "TVSMOTOR", "UBL", "ULTRACEMCO", "UPL", "VEDL", "VOLTAS", "WIPRO", "ZEEL", "ZYDUSLIFE"
];
const expiryDateStore = initializeExpiryDateStore();



type Comparison = 'up' | 'down' | null;
type previousDay = number | null;



// Create a functional component
const DataTable = observer(() => {
  console.log("DataTable rendered");
  const { data, underlyingValue, isInitialLoadCompleted} = paytmSocketStore;
  const [selectedRange, setSelectedRange] = useState<number | "All">(5);
  const selectedSymbol = symbolStore.selectedSymbol || "NIFTY"; // Set the selected symbol
  const [isDividedByLotSize, setIsDividedByLotSize] = useState(false);

   // Implement the logic to fetch data for the selected symbol and expiry when the component mounts

   const { connectWebSocket } = useWebSocketMobX();

   useEffect(() => {
     // Create an autorun to call connectWebSocket when selectedSymbol or selectedExpiry changes
     const autorunDisposer = autorun(() => {
       const { selectedSymbol, selectedExpiry } = paytmSocketStore;
       if (selectedSymbol && selectedExpiry) {
         connectWebSocket();
       }
     });
 
     return autorunDisposer; // Cleanup function
   }, [connectWebSocket]); // Dependencies
 

  





// write a function to handle the symbol change event


const handleSymbolChange = async (event: any) => {

  const selectedSymbol = event.value; // Access selected value directly from the event parameter
  console.log('Selected symbol:', selectedSymbol);
  paytmSocketStore.setDefaultSymbol(selectedSymbol); 
  try {
    // Clear the expiry dates and selected expiry before fetching new expiry dates

    // Fetch expiry dates for the selected symbol
    await expiryDateStore.fetchExpiryDatesForSymbol(selectedSymbol);
    const expiryDates = expiryDateStore.expiryDates;

    // Set the selected expiry date in the MobX store to the first expiry date
    

  } catch (error) {
    console.error('Error fetching expiry dates:', error);
  }

};


// Add this inside your component or function component

// Define a useEffect hook to fetch the expiry dates when the component mounts
useEffect(() => {
  if (!expiryDateStore.expiryDates.length) {
    // Fetch expiry dates only if they are not already present in the store
    expiryDateStore.fetchExpiryDatesForSymbol(selectedSymbol);
  }
  expiryDateStore.fetchExpiryDatesForSymbol(selectedSymbol);
}, [selectedSymbol]); // Empty dependency array to run only once on component mount

useEffect(() => {
  const expiryDates = expiryDateStore.expiryDates;
  console.log('Expiry Dates useEffect:', expiryDates);
}, []); // Add expiryDateStore.expiryDates as a dependency



// Now you can access expiryDates using the expiryDateStore instance



  // Now you can set the expiry dates in the component state
  


  


// Update the selectedExpiry state in the handleExpiryChange function
const handleExpiryChange = (event: any) => { // Change event type to 'any' temporarily
  const selectedExpiry = event.itemData.value; // Access the selected value from event.itemData
  console.log("Selected expiry:", selectedExpiry); // Log the selected value for debugging
  paytmSocketStore.setSelectedExpiry(selectedExpiry);
   // Update the selected expiry in the store
};


//Data processing and grid rendering function starts here

  // Check if there is no data
  if (!data.length) {
    return (
      <div>{isInitialLoadCompleted ? <Spinner /> : "Data Loading"}</div>
    );
  }
  //console.log (isInitialLoadCompleted)

  if (!paytmSocketStore.isInitialLoadCompleted) {
    // Return a loading indicator or null if the initial load is not completed
    return null;
  }

  let previousDay = "22426.20";
  let previousdDayNumber = Number(previousDay);
  paytmSocketStore.setpreviousDay(previousdDayNumber);
  const getComparison = (previousDay: number | null, underlyingValue: number | null): Comparison => {
    if (previousDay !== null && underlyingValue !== null) {
      if (previousDay > underlyingValue) {
        return 'up';
      } else if (previousDay < underlyingValue) {
        return 'down';
      }
    }
    return null;
  };

  const comparison: Comparison = getComparison(underlyingValue, previousdDayNumber);
  //console.log(sortedData);

  const calculateATMStrikePrice = (underlyingValue: number): number => {
    // Round the underlying value to the nearest 50
    return Math.round(underlyingValue / 50) * 50;
    
  };
  //console.log(underlyingValue);
  const getATMStrikePrice = (underlyingValue: number | null): number => {
    // If underlyingValue is null, return a default value or handle the case accordingly
    if (underlyingValue === null) {
      // Return a default value or throw an error or handle the case as per your requirement
      return 0; // Default value, replace with appropriate handling
    }

    // Otherwise, calculate and return the ATM strike price
    return calculateATMStrikePrice(underlyingValue);
  };

  const handleRangeChange = (range: 3 | 5 | 10 | "All") => {
    setSelectedRange(range);
    console.log("Selected range:", range);
  };
  

    
  //console.log(sortedData);
  // Calculate the index of the ATM Strike Price in the sorted data

  // Call the function and log the result

  const calculateTotals = () => {
    let totalCEOpenInterest = 0;
    let totalCETotalTradedVolume = 0;
    let totalPEOpenInterest = 0;
    let totalPETotalTradedVolume = 0;

    data.forEach((item: OptionData) => {
      if (item.CE_openInterest !== undefined) {
        totalCEOpenInterest += item.CE_openInterest;
      }
      if (item.CE_totalTradedVolume !== undefined) {
        totalCETotalTradedVolume += item.CE_totalTradedVolume;
      }
      if (item.PE_openInterest !== undefined) {
        totalPEOpenInterest += item.PE_openInterest;
      }
      if (item.PE_totalTradedVolume !== undefined) {
        totalPETotalTradedVolume += item.PE_totalTradedVolume;
      }
    });

    return {
      totalCEOpenInterest,
      totalCETotalTradedVolume,
      totalPEOpenInterest,
      totalPETotalTradedVolume,
    };
  };

  const totals = calculateTotals();
  const putCallRatio =
    totals.totalCEOpenInterest !== 0
      ? (totals.totalPEOpenInterest / totals.totalCEOpenInterest).toFixed(2)
      : 0; // Default to 0 if total call open interest is 0 to avoid division by zero

  // Map over the data to create rows
  const atmStrikePrice = getATMStrikePrice(paytmSocketStore.underlyingValue);

  const calculateFairPrice = (data: OptionData[], atmStrikePrice: number) => {
    const ceLastPrice =
      data.find((row) => row.strikePrice === atmStrikePrice)?.CE_lastPrice || 0;
    const peLastPrice =
      data.find((row) => row.strikePrice === atmStrikePrice)?.PE_lastPrice || 0;

    let fairPrice: number = atmStrikePrice + ceLastPrice - peLastPrice;

    // Using parseFloat to convert the string back to a number
    fairPrice = parseFloat(fairPrice.toFixed(2));

    return fairPrice;
  };

  const fairPrice = calculateFairPrice(
    data,
    getATMStrikePrice(underlyingValue)
  );
  // Assuming 'data' is an array of OptionData
  const aggregatedPEValue = data.reduce((total, option) => {
    if (
      option.PE_openInterest !== undefined &&
      option.PE_lastPrice !== undefined
    ) {
      return total + option.PE_openInterest * option.PE_lastPrice;
    }
    return total;
  }, 0);

  const aggregatedCEValue = data.reduce((total, option) => {
    if (
      option.CE_openInterest !== undefined &&
      option.CE_lastPrice !== undefined &&
      option.CE_openInterest !== 0
    ) {
      return total + option.CE_openInterest * option.CE_lastPrice;
    }
    return total;
  }, 0);

  const pcrp = (aggregatedPEValue / aggregatedCEValue).toFixed(2);


  //console.log('PCRP', pcrp);

  

  // Table header
  const headers = (
    <>
      <tr>
        <th className={styles.headerRow} >OI</th>
        <th className={styles.headerRow}>Volume</th>
        <th className={styles.headerRow}>IV</th>
        <th className={styles.headerRow}>Premium</th>
        <th className={styles.headerRow}>StrikePrice</th>
        <th className={styles.headerRow}>Premium</th>
        <th className={styles.headerRow}>IV</th>
        <th className={styles.headerRow}>Volume</th>
        <th className={styles.headerRow}>OI</th>
      </tr>
      <tr></tr>
    </>
  );

  

  const renderRows = (rows: OptionData[]) => {
    
    
    const atmIndex = rows.findIndex((row) => row.strikePrice === atmStrikePrice);
    let startIndex = 0;
    let endIndex = rows.length;

    if (selectedRange !== "All") {
        // Ensure selectedRange is always treated as a number
        const selectedRangeNumber = typeof selectedRange === 'number' ? selectedRange : parseInt(selectedRange, 10);


        // Calculate startIndex and endIndex based on selectedRange
        startIndex = Math.max(0, atmIndex - selectedRangeNumber);
        endIndex = Math.min(rows.length, atmIndex + selectedRangeNumber + 1);
    }

    return rows.slice(startIndex, endIndex).map((item: OptionData, index: number) => {
      const rowIndex = startIndex + index;

      // Determine the position relative to the ATM strike price
      const isAboveStrikePriceRow = rowIndex < atmIndex;
      const isBelowStrikePriceRow = rowIndex > atmIndex;
      const key = `${item.strikePrice}_${index}`;

      

      return (
        <tr key={item.strikePrice} className={[
          
          isAboveStrikePriceRow ? styles.aboveStrikePriceRow : '',
          isBelowStrikePriceRow ? styles.belowStrikePriceRow : '',
        ].join(' ')}>
          {/* CE OI cell */}
          <td
            style={{
              textAlign: "center",
              verticalAlign: "middle",
              backgroundColor: isAboveStrikePriceRow ? "lightgrey" : "", // Transparent version of #212121
            }}
          >
            <div>
              {item.CE_openInterest?.toLocaleString() ?? ""} (
              {item.CE_changeinOpenInterest?.toLocaleString() ?? ""})
            </div>
            <div className={styles.grreksContainer}>
              <span className={styles.greekLabel}>Vega</span>
              <span className={styles.greekValue}>{item.CE_vega}</span>
            </div>
          </td>

          {/* Volume cell */}
          <td
            style={{
              textAlign: "center",
              verticalAlign: "middle",
              backgroundColor: isAboveStrikePriceRow ? "lightgrey" : "",
            }}
          >
            <div>{item.CE_totalTradedVolume?.toLocaleString() ?? ""}</div>
            <div className={styles.greekNumbers}>
              <span className={styles.greekLabel}>Gamma</span>
              <span className={styles.greekValue}>{item.CE_gamma}</span>
            </div>
          </td>

          {/* IV cell */}
          <td
            style={{
              textAlign: "center",
              verticalAlign: "middle",
              backgroundColor: isAboveStrikePriceRow ? "lightgrey" : "",
            }}
          >
            <div>{item.CE_impliedVolatility?.toLocaleString() ?? ""}</div>
            <div>
              <span className={styles.greekValue}>{item.CE_theta}</span>
            </div>
          </td>

          {/* Premium cell */}
          <td
            style={{
              textAlign: "center",
              verticalAlign: "middle",
              backgroundColor: isAboveStrikePriceRow ? "lightgrey" : "",
            }}
          >
            <div>{item.CE_lastPrice?.toLocaleString() ?? ""}</div>
            <div>
              <span className={styles.greekValue}>{item.CE_delta}</span>
            </div>
          </td>

          {/* StrikePrice cell */}
          <td
            style={{
              backgroundColor:
                atmStrikePrice === item.strikePrice ? "lightgrey" : "",
              textAlign: "center",
            }}
          >
            {item.strikePrice}
          </td>
          {/* Premium cell */}
          <td
            style={{
              textAlign: "center",
              verticalAlign: "middle",
              backgroundColor: isBelowStrikePriceRow ? "lightgrey" : "",
            }}
          >
            <div>{item.PE_lastPrice}</div>
            <div>
              <span className={styles.greekLabel}>{item.PE_delta}</span>
            </div>
          </td>

          {/* IV cell */}
          <td
            style={{
              textAlign: "center",
              verticalAlign: "middle",
              backgroundColor: isBelowStrikePriceRow ? "lightgrey" : "",
            }}
          >
            <div>{item.PE_impliedVolatility}</div>
            <div>
              <span className={styles.greekLabel}>{item.PE_theta}</span>
            </div>
          </td>
          {/* Volume cell */}
          <td
            style={{
              textAlign: "center",
              verticalAlign: "middle",
              backgroundColor: isBelowStrikePriceRow ? "lightgrey" : "",
            }}
          >
            <div>{item.PE_totalTradedVolume?.toLocaleString() ?? ""}</div>
            <div className={styles.greekData}>
            <span>Gamma</span>
            <span>{item.PE_gamma}</span>
            </div>
          </td>
          {/* PE OI cell */}
          <td
            style={{
              textAlign: "center",
              verticalAlign: "middle",
              backgroundColor: isBelowStrikePriceRow ? "lightgrey" : "",
            }}
          >
            <div>
              {item.PE_openInterest?.toLocaleString() ?? ""} (
              {item.PE_changeinOpenInterest?.toLocaleString() ?? ""})
            </div>
            <div>
              <span className={styles.greekLabel}>Vega{item.PE_vega}</span>
            </div>
          </td>
        </tr>
      );
    });
  };

const pcrpValue = parseFloat(pcrp);
const pcrpFormatted = pcrpValue.toFixed(2); // Convert to a string with 2 decimal places





  return (
    <div>
 <div className={styles.grid}>
  <div className={styles.gridRow}>
    
   
  </div>
  <div className={styles.actionGrid}>
    <div>
      {/* Populate the dropdown with symbols */}
      <DropDownListComponent
        dataSource={symbolData}
        placeholder="Select a symbol"
        change={handleSymbolChange}
        value={"NIFTY"}
      />
    </div>
    <div >
      <DropDownListComponent
        dataSource={expiryDateStore.expiryDates}
        placeholder="Select Expiry Date"
        change={handleExpiryChange}
        value={expiryDateStore.expiryDates[0]}
      />
    </div>
  </div>
</div>
<div className={styles.container}>
  <div className={styles.symbolInfo}>
    <div>
    <div className={styles.symbolRows}>
    {paytmSocketStore.selectedSymbol} {underlyingValue !== null ? underlyingValue.toFixed(2) : ''}
      
      {/* Conditionally render the arrow based on the comparison */}
      {comparison !== null && (
        <span className={comparison === 'up' ? styles.arrowUp : styles.arrowDown}>
          {comparison === 'up' ? '▲' : '▼'}
        </span>
      )}
    </div>
      <div className={styles.symbolRows}>Fair Price {fairPrice}</div>
      <div className={styles.symbolRows}>PCR {putCallRatio}</div>
      <div className={styles.symbolRows}>PCRP {pcrpFormatted}</div>
      <div>
      {[3, 5, 10, "All"].map((num) => (
        <div
          key={num}
          className={`${styles.box} ${
            selectedRange === num ? styles.selectedBox : ""
          }`}
          onClick={() => handleRangeChange(num as 3 | 5 | 10 | "All")}
        >
          {num}
        </div>
      ))}
    </div>
    {/* Toggle for Lot Size */}
    <div id="lot_size_radio">
      <input type="radio" id="fullOI" name="displayMode" />
      <label className={styles.button} htmlFor="fullOI">
        ALL
      </label>
      <input type="radio" id="dividedOI" name="displayMode" />
      <label className={styles.button} htmlFor="dividedOI">
        BY LOT
      </label>
    </div>
    </div>
    
  </div>
  <div className={styles.dataTable}>
    <table className={styles.table}>
      <thead>{headers}</thead>
      <tbody>{renderRows(data)}</tbody>
    </table>
    {/* Your table code goes here */}
    
  </div>
  <div className={styles.grid}>
      <div className={styles.ratioslTable}>
        <StrikePriceRatioTable selectedRange={selectedRange} />
      </div>
    </div>
</div>

</div>

    
  );
});



// Memoize the DataTable component to prevent unnecessary re-renders
export default React.memo(DataTable);
