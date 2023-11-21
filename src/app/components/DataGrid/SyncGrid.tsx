import React from "react";
import { useEffect, useState, useRef } from "react";
import { useSelector,useDispatch } from 'react-redux'; // Import useSelector from react-redux
import { RootState} from '../../../stores/store'; // Adjust the import path
import { selectUnderlyingValue } from '../../../stores/websocketSelectors'; // adjust the path as necessary


import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  VirtualScroll
} from "@syncfusion/ej2-react-grids";
import { OptionData } from "../../../types"; // Adjust the import path as needed
import styles from "./syncoptions.module.css";
import {
  DropDownListComponent,
  MultiSelectComponent,
} from "@syncfusion/ej2-react-dropdowns";
//import { DataManager, UrlAdaptor } from "@syncfusion/ej2-data";





interface GridComponentProps {
  data: OptionData[];
  
}

const Spinner = () => {
  return <div className={styles.spinner}></div>;
};


const SyncGrid: React.FC<GridComponentProps> = () => {
  const SyncGrid: React.FC = () => {
    const gridRef = useRef(null);
    const data = useSelector((state: RootState) => state.websocket.data);
    const updatedStrikePrices = useSelector((state: RootState) => state.websocket.updatedData); // Array of updated strikePrice values




  function updateCellValues() {
    for (let i = 0; i < grid.currentViewData.length; i++) {
        const rowData = grid.currentViewData[i];
        if (rowData === undefined) {
            return;
        }

        // Example: Updating some fields based on your data structure
        grid.setCellValue(rowData['id'], 'strikePrice', rowData['strikePrice']);
        grid.setCellValue(rowData['id'], 'underlyingValue', rowData['underlyingValue']);
        grid.setCellValue(rowData['id'], 'CE_openInterest', rowData['CE_openInterest']);
        // ... and so on for each field you want to update

        // Calculate or obtain new values for fields as required
        // For example, if you need to update 'CE_lastPrice' based on some logic:
        let newCELlastPrice = calculateNewCELlastPrice(rowData); // Replace with your actual calculation
        grid.setCellValue(rowData['id'], 'CE_lastPrice', newCELlastPrice);

        // Continue for other fields...
    }
}

  const underlyingValue = useSelector(selectUnderlyingValue);
  console.log ("Current Price",underlyingValue)

  // Calculate the closest strikePrice
  const closestStrikePrice = Math.round(underlyingValue / 50) * 50;
  console.log ("ATM Strike Price",closestStrikePrice)
  const lot_size = data[0]?.lot_size;

  const atmIndexRef = useRef<HTMLDivElement>(null); // Explicitly type the ref
  const atmIndex = data.findIndex(
    (item) => item.strikePrice === closestStrikePrice
  );
  console.log("ATM Index", atmIndex); // This will log the index of the first occurrence where ATMindex is true
  const atmStrikePrice = atmIndex !== -1 ? data[atmIndex].strikePrice : null;
  console.log("ATM Strike Price",atmStrikePrice);
  const [selectedRange, setSelectedRange] = useState<number | "All">("All"); // Set initial value to 'All'

  const gridRef = useRef<GridComponent | null>(null);


  const [isDividedByLotSize, setIsDividedByLotSize] = useState(false);

  const [isDataLoaded, setIsDataLoaded] = useState(false); // New state for tracking data load status


  useEffect(() => {
    // Check if data array contains an element with strikePrice of 21250
    const hasRequiredStrikePrice = data.some(item => item.strikePrice === 21250);
  
    if (data.length > 0 && hasRequiredStrikePrice) {
      setIsDataLoaded(true);
    }
  }, [data]);

  const calculateFairPrice = (data: any, atmStrikePrice: number) => {
    const ceLastPrice =
      data?.find((row: any) => row.strikePrice === atmStrikePrice)
        ?.CE_lastPrice || 0;
    const peLastPrice =
      data?.find((row: any) => row.strikePrice === atmStrikePrice)
        ?.PE_lastPrice || 0;

    // Calculate the fair price based on CE and PE last prices
    const fairPrice = atmStrikePrice + ceLastPrice - peLastPrice;

    return fairPrice;
  };


   function FairPriceCard() {
    const atmStrikePrice = atmIndex !== -1 ? data[atmIndex].strikePrice : null;
    const fairPrice = atmStrikePrice !== null ? calculateFairPrice(data, atmStrikePrice) : null;
  
    return (
      <div>
        Fair Price: {fairPrice !== null ? fairPrice.toFixed(2) : "N/A"}
      </div>
    );
  }

   // helper function to round a value to the nearest half up
   function roundHalfUp(niftyValue: number, base: number) {
    return (
      Math.sign(niftyValue) * Math.round(Math.abs(niftyValue) / base) * base
    );
  }

  function Instrument() {
    const underlyingValue =
      data[0]?.underlyingValue;
      //console.log("Underlying Value",underlyingValue);
  
    return (
      <div>
        Instrument: {underlyingValue}
      
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
            onClick={() => setSelectedRange(num as number | "All")}
          >
            {num}
          </div>
        ))}
      </div>
    );
  }

  
  if (isDataLoaded) {

  const startSliceIndex =
    selectedRange === "All"
      ? 0 // When 'All' is selected, start from the beginning
      : Math.max(atmIndex - selectedRange, 0);
  //console.log("Start Slice Index:", startSliceIndex);
  const displayData =
    data && selectedRange !== "All" // Check if 'All' is selected
      ? data.slice(
          startSliceIndex,
          atmIndex + selectedRange + 1
        )
      : data || []; // Use the entire data array when 'All' is selected
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

  // This calculates the ATM's index within the `displayData` array
  const newATMIndex = atmIndex - startSliceIndex;

  

  // rowDataBound event handler
  const rowDataBound = (args: any) => {
    const rowIndex = Number(args.row.getAttribute("aria-rowindex"));
    if (atmIndex !== -1) {
      const selectedRangeNumber = Number(selectedRange); // Cast selectedRange to a number
      if (
        rowIndex - 1 ===
        atmIndex -
          Math.max(
            (atmIndex || 0) - selectedRangeNumber,
            0
          )
      ) {
        args.row.style.background = "beige";

        // Find the Strike Price cell and apply custom styling
        const strikePriceCell = args.row.querySelector('[aria-colindex="5"]');
        if (strikePriceCell) {
          strikePriceCell.style.fontWeight = "bold";
          strikePriceCell.style.fontSize = "13";
          strikePriceCell.style.color = "#090909";
          strikePriceCell.style.padding = "10px"; // Increase cell size
          strikePriceCell.style.boxShadow =
            "5px 0 5px -2px #888, -5px 0 5px -2px #888"; // Add a shadow
        }
      }
    }
  };

  // queryCellInfo event handler
  const queryCellInfo = (args: any) => {
    // Array of the names of the columns for which you want to change the cell color
    const ceColumns = ["CE_OI", "CE_VOLUME", "CE_IV", "CE_PREMIUM"];
    const peColumns = ["PE_OI", "PE_VOLUME", "PE_IV", "PE_PREMIUM"];

    // Check if the parent element exists before trying to access it
    if (args.cell.parentElement) {
      const rowIndex = Number(
        args.cell.parentElement.getAttribute("aria-rowindex")
      );

      // Check if the current cell's column is in the array
      if (ceColumns.includes(args.column.field)) {
        // Check the condition for which you want to change the color
        if (
          atmIndex !== -1 &&
          rowIndex - 1 < newATMIndex
        ) {
          args.cell.style.background = "lightgrey";
        }
      }

      if (peColumns.includes(args.column.field)) {
        const rowIndex = Number(
          args.cell.parentElement.getAttribute("aria-rowindex")
        );

        if (
          selectedRange !== "All" &&
          atmIndex !== -1 &&
          rowIndex - 1 > newATMIndex
        ) {
          args.cell.style.background = "lightgrey";
        }
      }
    }

    if (args.column.field === "strikePrice") {
      args.cell.style.backgroundColor = "#C9C8C8";
    }

    // Center align the content in all columns
    args.cell.style.textAlign = "center";
  };

  

  const cellTemplate = (
    type: "CE" | "PE",
    property: "Delta" | "Vega" | "Gamma" | "Theta",
    rowData: any
  ) => {
    const formatNumber = (number: number, decimalPlaces: number) => {
      // Round the number to the specified decimal places
      const roundedNumber = number.toFixed(decimalPlaces);
    
      // Use Intl.NumberFormat to format the number with separators and locale
      const formatter = new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      });
    
      return formatter.format(parseFloat(roundedNumber)); // Ensure parseFloat for proper formatting
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

  
 

 

  

  const putCallRatio =
    totalCE_openInterest !== 0
      ? (totalPE_openInterest / totalCE_openInterest).toFixed(2)
      : 0; // Default to 0 if total call open interest is 0 to avoid division by zero

  

  

 

  

  //console.log('Componet store near return', store);

  return (
    <div className={"{styles.flexContainer}fluent-dark"}>
      
        <div>
          <div className={styles.container}>
            {/* Instrument Card */}
            <div className={styles.eCard}>
            <Instrument />
            </div>

            {/* Fair Price Card */}
            <div className={styles.eCard}>
              <FairPriceCard />
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

         

            <div className={styles.stylebox}>
              {" "}
              {/* This is the new div for selecting range */}
              {[3, 5, 10, "All"].map((num) => (
                <div
                  key={num}
                  className={`${styles.box} ${
                    selectedRange === num ? styles.selectedBox : ""
                  }`}
                  onClick={() => setSelectedRange(num as number | "All")} // Explicitly cast num
                >
                  {num}
                </div>
              ))}
            </div>

            <div>
             
            </div>
            <div>
            
            </div>
          </div>
      
          <div>
            <GridComponent
              ref={gridRef}
              dataSource={displayData || []}
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
                  field="CE_IV"
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
      <div className={styles.dataContainer}>
              <div className={styles.dataRow}>
                <span className={styles.label}>Total CE Open Interest:</span>
                <span className={styles.value}>
                  {isDividedByLotSize && lot_size
                    ? (totalCE_openInterest / lot_size).toLocaleString("en-US")
                    : totalCE_openInterest.toLocaleString("en-US")}
                </span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.label}>
                  Total CE Total Traded Volume:
                </span>
                <span className={styles.value}>
                  {isDividedByLotSize && lot_size
                    ? (totalCE_totalTradedVolume / lot_size).toLocaleString(
                        "en-US"
                      )
                    : totalCE_totalTradedVolume.toLocaleString("en-US")}
                </span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.label}>Total PE Open Interest:</span>
                <span className={styles.value}>
                  {isDividedByLotSize && lot_size
                    ? (totalPE_openInterest / lot_size).toLocaleString("en-US")
                    : totalPE_openInterest.toLocaleString("en-US")}
                </span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.label}>
                  Total PE Total Traded Volume:
                </span>
                <span className={styles.value}>
                  {isDividedByLotSize && lot_size
                    ? (totalPE_totalTradedVolume / lot_size).toLocaleString(
                        "en-US"
                      )
                    : totalPE_totalTradedVolume.toLocaleString("en-US")}
                </span>
              </div>
            </div>
          </div>
      
    </div>
  );
                     } else {
    // Display spinner while data is not yet loaded
    return <div className={styles.spinnerContainer}><Spinner /></div>;
  }
};

export default SyncGrid;
