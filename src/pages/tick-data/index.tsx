import React, { useEffect, useState, useRef } from "react";
import { observer } from "mobx-react-lite";
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
} from "@syncfusion/ej2-react-grids";
import { useFeedWorker } from "../../hooks/useFeedWorker";
import { OptionData } from "../../types";
import { paytmSocketStore } from "../../stores/PaytmSocketStore";
import {
  initializeNseFetchStore,
  NseFetchStore,
} from "../../stores/NseFetchStore";
import styles from "./syncoptions.module.css";
import {
  DropDownListComponent,
  MultiSelectComponent,
} from "@syncfusion/ej2-react-dropdowns";
import {
  initializeExpiryDateStore,
  ExpiryDateStore,
} from "../../stores/ExpiryDateStore";
import { initializeSymbolStore, SymbolStore } from "../../stores/SymbolsStore";
import { DefaultStore } from "../../stores/DefaultStore";
import { DataManager, UrlAdaptor } from "@syncfusion/ej2-data";

const SyncComponent = observer(
  ({
    initialData,
    initialStock,
  }: {
    initialData: OptionData[];
    initialStock: string;
  }) => {
    const [atmIndex, setAtmIndex] = useState(-1);
    const [selectedRange, setSelectedRange] = useState<number | "All">(10); // Set initial value to 'All'
    const [isDividedByLotSize, setIsDividedByLotSize] = useState(false);
    const [expiryDateStore, setExpiryDateStore] =
      useState<ExpiryDateStore | null>(null);
    const [expiryDate, setExpiryDate] = useState("");

    const [isFetchingExpiryDates, setIsFetchingExpiryDates] = useState(false);
    const gridRef = useRef<GridComponent | null>(null);

    // Since we're using MobX, it will automatically subscribe to the relevant observables
    // and re-render the component when they change.
    useFeedWorker();

    const { data, isLoading: storeIsLoading } = paytmSocketStore;
    //console.log(data);

   

    const [symbolStore, setSymbolStore] = useState<{
      symbolStore: SymbolStore;
    } | null>(null);

    useEffect(() => {
      if (data && data.length > 0) {
        console.log("Data received in component:", data);
        // Only call setLoading if the loading state needs to change.
        if (paytmSocketStore.isLoading) {
          paytmSocketStore.setLoading(false);
        }
      }
    }, [data]);


    

    
    const [userSelectedStock, setUserSelectedStock] = useState(
      initialStock || ""
    );

    const onUserSelectDate = async (newDate: string) => {
      console.log(`Expiry date changed to: ${newDate}`); // Log the new expiry date

      if (expiryDateStore) {
        console.log("ExpiryDateStore:", expiryDateStore); // Log the entire store to inspect its content

        // Update the selected expiry date in the store
        paytmSocketStore.setExpiryDate(newDate);

        // Check if the expiry dates are available in the expiryDateStore
        if (expiryDateStore.expiryDates.length > 0) {
          console.log("Expiry Dates:", expiryDateStore.expiryDates); // Log all expiry dates to inspect them

          // Set the expiryDate to the selected expiry date
          paytmSocketStore.setExpiryDate(newDate);

          // Fetch data for the selected expiry date and selected stock
          const selectedStock = userSelectedStock || "NIFTY"; // Use a default stock if not selected
          await paytmSocketStore.fetchData(selectedStock, newDate);
        } else {
          console.warn("No expiry dates available for the selected symbol");
        }
      } else {
        console.warn("Expiry Date Store is not initialized yet");
      }
    };

    useEffect(() => {
      const symbolStoreInstance = initializeSymbolStore();
      symbolStoreInstance.symbolStore.fetchSymbols().then(() => {
        setSymbolStore({ symbolStore: symbolStoreInstance.symbolStore });
      });
    }, []);

   

    
    
    const startSliceIndex =
      selectedRange === "All"
        ? 0 // When 'All' is selected, start from the beginning
        : Math.max(atmIndex - selectedRange, 0);
    //console.log("Start Slice Index:", startSliceIndex);
    const displayData =
      paytmSocketStore.data && selectedRange !== "All" // Check if 'All' is selected
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

    

    const rowDataBound = (args: any) => {
      

      const rowIndex = Number(args.row.getAttribute("aria-rowindex"));
      // Assuming atmIndex is accessible and it is the index of the row with ATM Strike
      const selectedRangeNumber = Number(selectedRange); // selectedRange should be defined and represent the range of rows you're interested in
      const atmIndex = data.findIndex(item => item.StrikeATM === true);

      if (typeof atmIndex === "number") {
        // If rowIndex - 1 is within the selected range of the atmIndex
        if (
          rowIndex - 1 >= atmIndex - selectedRangeNumber &&
          rowIndex - 1 <= atmIndex + selectedRangeNumber
        ) {
          // Then apply the custom styling to the row
          args.row.style.background = "beige";

          // Additional code to find and style the specific Strike Price cell if necessary...
          // For example:
          const strikePriceCell = args.row.querySelector('[aria-colindex="5"]');
          if (strikePriceCell) {
            // Apply custom styles to strikePriceCell
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
            paytmSocketStore.atmStrike !== null &&
            rowIndex - 1 < atmIndex // Using atmIndex instead of newATMIndex
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
            paytmSocketStore.atmStrike !== null &&
            rowIndex - 1 > atmIndex
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

    function formatNumberWithSeparator(number: number): string {
      return number.toLocaleString("en-IN");
    }

    const cellTemplate = (
      type: "CE" | "PE",
      property: "Delta" | "Vega" | "Gamma" | "Theta",
      rowData: any
    ) => {
      const formatNumber = (number: number) => {
        return Math.round(number).toLocaleString("en-IN");
      };
      switch (property) {
        case "Delta":
          return (
            <div>
              <div className={styles.rowNumbers}>
                {rowData[`${type}_lastPrice`]}
              </div>
              <div className={styles.rowNumbers}>
                Delta: {rowData[`${type}_delta`]}
              </div>
            </div>
          );
        case "Vega":
          return type === "CE" ? ceVega(rowData) : peVega(rowData);

        case "Gamma":
          const lot_size = paytmSocketStore?.lot_size;
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
                Gamma: {rowData[`${type}_gamma`]}
              </div>
            </div>
          );

        case "Theta":
          return (
            <div>
              <div className={styles.rowNumbers}>
                {rowData[`${type}_impliedVolatility`]}
              </div>
              <div className={styles.rowNumbers}>
                {rowData[`${type}_calcIV`]}
              </div>
              <div className={styles.greekNumbers}>
                Theta: {rowData[`${type}_theta`]}
              </div>
            </div>
          );
      }
    };

    const ceVega = (rowData: any) => {
      const color = rowData["CE_changeinOpenInterest"] > 0 ? "green" : "green";
      //const changeInOI = Math.abs(rowData['CE_changeinOpenInterest']);

      const lot_size = paytmSocketStore.lot_size;
      console.log("Lot Size:", lot_size);

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
            <div
              className={styles.progressBarValue}
              style={progressStyle}
            ></div>
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
      const lot_size = paytmSocketStore.lot_size;

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
            <div
              className={styles.progressBarValue}
              style={progressStyle}
            ></div>
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

    const lotSize = paytmSocketStore.lot_size;
    
    const putCallRatio =
      totalCE_openInterest !== 0
        ? (totalPE_openInterest / totalCE_openInterest).toFixed(2)
        : 0; // Default to 0 if total call open interest is 0 to avoid division by zero

        function Instrument() {
          // Assuming paytmSocketStore provides a way to subscribe to the data
          // This could be a useContext call if it's a React context, or a custom hook if it's a state management library
          const underlyingValue = paytmSocketStore.underlyingValue || 0;
          return <div>Instrument: {underlyingValue}</div>;
        }
        
    

    const calculateFairPrice = (data: any, atmStrikePrice: number) => {
      const ceLastPrice =
        data?.find((row: any) => row.strikePrice === atmIndex)
          ?.CE_lastPrice || 0;
      const peLastPrice =
        data?.find((row: any) => row.strikePrice === atmIndex)
          ?.PE_lastPrice || 0;

      // Calculate the fair price based on CE and PE last prices
      const fairPrice = atmStrikePrice + ceLastPrice - peLastPrice;

      return fairPrice;
    };

    function FairPriceCard() {
      // Assuming paytmSocketStore is defined and accessible in this scope
      const atmStrikePrice = paytmSocketStore.atmStrike || 0;
      const fairPrice = calculateFairPrice(
        paytmSocketStore.data,
        atmIndex // use the variable atmStrikePrice instead of atmStrike
      );
      return <div>Fair Price: {fairPrice.toFixed(2)}</div>;
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
              onClick={() => setSelectedRange(num as number | "All")}
            >
              {num}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className={"{styles.flexContainer}fluent-dark"}>
        {paytmSocketStore.isLoading ? (
          <div className={styles.loadingContainer}>
            {/* You can use a spinner component here, or simply a text message */}
            <div className={styles.spinner}></div>
            <p>Loading data, please wait...</p>
          </div>
        ) : (
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
                    onClick={() => setSelectedRange(num as number | "All")} // Explicitly cast num
                  >
                    {num}
                  </div>
                ))}
              </div>

              <div>
                <DropDownListComponent
                  placeholder="Select Expiry Dates"
                  dataSource={expiryDateStore?.expiryDates || []}
                  value={expiryDate || expiryDateStore?.expiryDates[0] || ""}
                  change={(e) => {
                    const selectedExpiryDate = e.value as string;
                    onUserSelectDate(selectedExpiryDate); // Call onUserSelectDate when a new date is selected
                  }}
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
                    dataSource={symbolStore?.symbolStore.symbols || []}
                    value={paytmSocketStore.symbol || "NIFTY"}
                    change={(e) => {
                      const selectedSymbol = e.value as string;
                      paytmSocketStore.setSymbol(selectedSymbol);
                      setIsFetchingExpiryDates(true);
                      expiryDateStore
                        ?.fetchExpiryDatesForSymbol(selectedSymbol)
                        .then(() => {
                          const firstExpiryDate =
                            expiryDateStore.expiryDates[0] || "";
                          setExpiryDate(firstExpiryDate);
                          paytmSocketStore.setExpiryDate(firstExpiryDate);
                          if (firstExpiryDate) {
                            paytmSocketStore.fetchData(
                              selectedSymbol,
                              firstExpiryDate
                            );
                          }
                          setIsFetchingExpiryDates(false);
                        });
                    }}
                    enabled={expiryDate !== ""}
                  />
                )}
              </div>
            </div>

            <div>
              <GridComponent
                ref={gridRef}
                dataSource={displayData || []}
                rowDataBound={rowDataBound}
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
                  {isDividedByLotSize && lotSize
                    ? (totalCE_openInterest / lotSize).toLocaleString("en-US")
                    : totalCE_openInterest.toLocaleString("en-US")}
                </span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.label}>
                  Total CE Total Traded Volume:
                </span>
                <span className={styles.value}>
                  {isDividedByLotSize && lotSize
                    ? (totalCE_totalTradedVolume / lotSize).toLocaleString(
                        "en-US"
                      )
                    : totalCE_totalTradedVolume.toLocaleString("en-US")}
                </span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.label}>Total PE Open Interest:</span>
                <span className={styles.value}>
                  {isDividedByLotSize && lotSize
                    ? (totalPE_openInterest / lotSize).toLocaleString("en-US")
                    : totalPE_openInterest.toLocaleString("en-US")}
                </span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.label}>
                  Total PE Total Traded Volume:
                </span>
                <span className={styles.value}>
                  {isDividedByLotSize && lotSize
                    ? (totalPE_totalTradedVolume / lotSize).toLocaleString(
                        "en-US"
                      )
                    : totalPE_totalTradedVolume.toLocaleString("en-US")}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

export default SyncComponent;
