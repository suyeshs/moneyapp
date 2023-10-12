import { observer } from "mobx-react";
import { reaction } from "mobx";
import { useEffect, useState, useRef } from "react";
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
} from "@syncfusion/ej2-react-grids";
import styles from "./syncoptions.module.css";
import { NseOptionData } from "../../types";
import { DataManager, UrlAdaptor } from "@syncfusion/ej2-data";
import {
  initializeNseFetchStore,
  NseFetchStore,
} from "../../stores/NseFetchStore";
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

const NseFlatDataOptions = observer(
  ({
    initialData,
    initialStock,
  }: {
    initialData: NseOptionData[];
    initialStock: string;
  }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [store, setStore] = useState<{ nseFetchStore: NseFetchStore } | null>(
      null
    );
    const [selectedRange, setSelectedRange] = useState<number | 'All'>('All'); // Set initial value to 'All'

    const gridRef = useRef<GridComponent | null>(null);
    const [expiryDateStore, setExpiryDateStore] =
      useState<ExpiryDateStore | null>(null);
    const [expiryDate, setExpiryDate] = useState("");
    const [userSelectedStock, setUserSelectedStock] = useState(
      initialStock || ""
    );
    // Add a new state to store the selected expiry dates
    const [selectedExpiryDates, setSelectedExpiryDates] = useState<string[]>(
      []
    );
    // Add a new state to store the previous instrument value
    const [prevInstrumentValue, setPrevInstrumentValue] = useState<
      number | null
    >(null);
    const [isFetchingExpiryDates, setIsFetchingExpiryDates] = useState(false);
    const [isDividedByLotSize, setIsDividedByLotSize] = useState(false);
    const [pcr, setPcr] = useState<number | null | undefined>(null);


    const dataManager = new DataManager({
      json: initialData,
      adaptor: new UrlAdaptor(),
    });
    const [symbolStore, setSymbolStore] = useState<{
      symbolStore: SymbolStore;
    } | null>(null);

    const onUserSelectDate = async (newDate: string) => {
      console.log(`Expiry date changed to: ${newDate}`); // Log the new expiry date
    
      // Update the selected expiry date in the store
      store?.nseFetchStore.setExpiryDate(newDate);
    
      // Fetch new data based on the updated expiryDate and the currently selected stock
      const selectedStock = userSelectedStock || 'NIFTY'; // Use a default stock if not selected
    
      // Check if the expiry dates are available in the expiryDateStore
      if (expiryDateStore && expiryDateStore.expiryDates.length > 0) {
        // Set the expiryDate to the first expiry date from the list
        const firstExpiryDate = expiryDateStore.expiryDates[0];
        store?.nseFetchStore.setExpiryDate(firstExpiryDate);
        
        // Fetch data for the first expiry date and selected stock
        await store?.nseFetchStore.fetchData(selectedStock, firstExpiryDate);
      } else {
        console.warn('No expiry dates available for the selected symbol');
      }
    };
    


    useEffect(() => {
      const symbolStoreInstance = initializeSymbolStore();
      symbolStoreInstance.symbolStore.fetchSymbols().then(() => {
        setSymbolStore({ symbolStore: symbolStoreInstance.symbolStore });
      });
    }, []);

    const fetchExpiryDatesAndData = async (
      symbol: string,
      expiryDateStore: ExpiryDateStore,
      nseFetchStore: NseFetchStore
    ) => {
      await expiryDateStore.fetchExpiryDatesForSymbol(symbol);
      const firstExpiryDate = expiryDateStore.expiryDates[0] || "";
      setExpiryDate(firstExpiryDate);
      nseFetchStore.setExpiryDate(firstExpiryDate);
      if (firstExpiryDate) {
        await nseFetchStore.fetchData(symbol, firstExpiryDate);
        dataManager.dataSource.json = nseFetchStore.data;
        setIsLoading(false);
      }
    };

    useEffect(() => {
      const initializeStores = async () => {
        const expiryDateStoreInstance = initializeExpiryDateStore();
        setExpiryDateStore(expiryDateStoreInstance);

        // Initialize DefaultStore
        const defaultStore = new DefaultStore();

        // Set default symbol and expiry date
        defaultStore.setSymbol("NIFTY");
        await expiryDateStoreInstance.fetchExpiryDatesForSymbol("NIFTY");
        //console.log(
          //"Fetched expiry dates:",
          //.expiryDates
        ///); // Debug line
        const firstExpiryDate = expiryDateStoreInstance.expiryDates[0] || "";
        //console.log("Setting expiry date to:", firstExpiryDate); // Debug line
        await defaultStore.setExpiryDate(firstExpiryDate);

        // Now initialize NseFetchStore with the DefaultStore instance
        const nseFetchStoreInstance = initializeNseFetchStore(
          defaultStore,
          expiryDateStoreInstance,
          initialData
        );
        setStore({ nseFetchStore: nseFetchStoreInstance });
      };

      initializeStores();
    }, [initialData, initialStock]);

    useEffect(() => {
      if (expiryDateStore && store?.nseFetchStore) {
        fetchExpiryDatesAndData(
          userSelectedStock || "NIFTY",
          expiryDateStore,
          store.nseFetchStore
        );
      }
    }, [userSelectedStock, expiryDateStore, store]);

    useEffect(() => {
      // Get the current instrument value
      const currentInstrumentValue =
        store?.nseFetchStore.data?.[0]?.CE_underlyingValue ||
        store?.nseFetchStore.data?.[0]?.PE_underlyingValue ||
        null;

      // If the current instrument value is not null, update the previous instrument value
      if (currentInstrumentValue !== null) {
        setPrevInstrumentValue(currentInstrumentValue);
      }
    }, [store]);

    useEffect(() => {
      return () => {
        store?.nseFetchStore.dispose();
      };
    }, [store]);

    const [isInitialRender, setIsInitialRender] = useState(true);

    useEffect(() => {
      const currentInstrumentValue =
        store?.nseFetchStore.data?.[0]?.CE_underlyingValue ||
        store?.nseFetchStore.data?.[0]?.PE_underlyingValue ||
        null;

      if (currentInstrumentValue !== null) {
        if (isInitialRender) {
          // For the initial render, just set the prevInstrumentValue to the current value.
          setIsInitialRender(false);
        } else if (prevInstrumentValue !== currentInstrumentValue) {
          // For subsequent renders, only update prevInstrumentValue if the current value has changed.
          setPrevInstrumentValue(currentInstrumentValue);
        }
      }
    }, [store, isInitialRender, prevInstrumentValue]);

    useEffect(() => {
      // Step 2: Update the state whenever the PCR changes.
      const disposer = reaction(
        () => store?.nseFetchStore.pcr,
        (newPcr) => {
          setPcr(newPcr);
        }
      );
  
      return () => {
        disposer();
      };
    }, [store]);

    useEffect(() => {
      const executeScroll = () => {
        if (
          gridRef.current &&
          store?.nseFetchStore &&
          store.nseFetchStore.atmStrikeIndex !== null
        ) {
          console.log("Preparing to autoscroll...");
          
          console.log("ATM Strike row number:", store.nseFetchStore.atmStrikeIndex + 1);
    
          const gridElement = gridRef.current.element;
          const rowHeight = gridElement.querySelector('.e-row')?.clientHeight || 0;
    
          if (rowHeight === 0) {
            console.log("Row height is zero, unable to calculate scroll position.");
            return;
          }
    
          console.log("Row height:", rowHeight);
    
          const atmRowPosition = store.nseFetchStore.atmStrikeIndex * rowHeight;
          console.log("ATM row position:", atmRowPosition);
    
          const containerHeight = gridElement.clientHeight;
          console.log("Container height:", containerHeight);
    
          let scrollPosition = atmRowPosition - containerHeight / 2;
          console.log("Calculated scroll position:", scrollPosition);
    
          if (scrollPosition < 0) {
            console.log("Scroll position is negative. Adjusting to zero.");
            scrollPosition = 0;  // Adjust the scroll position to zero if it's negative
          }
    
          gridElement.scrollTop = scrollPosition;
          console.log("Autoscroll executed.");
        } else {
          console.log("Required data or elements are not yet available.");
        }
      };
    
      setTimeout(executeScroll, 500);
    }, [store?.nseFetchStore.data]);
    
  

    const atmIndex = store?.nseFetchStore.atmStrikeIndex || 0;
    const startSliceIndex =
      selectedRange === 'All'
          ? 0 // When 'All' is selected, start from the beginning
          : Math.max(atmIndex - selectedRange, 0);
    //console.log("Start Slice Index:", startSliceIndex);
    const displayData =
  store?.nseFetchStore.data &&
  selectedRange !== 'All' // Check if 'All' is selected
    ? store.nseFetchStore.data.slice(
        startSliceIndex,
        atmIndex + selectedRange + 1
      )
    : store?.nseFetchStore.data || []; // Use the entire data array when 'All' is selected
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
    const [hasError, setHasError] = useState(false);

    //console.log("Store:", store?.nseFetchStore);
    //console.log("ATM Strike Index:", store?.nseFetchStore.atmStrikeIndex);
    //console.log("Data Length:", store?.nseFetchStore.data.length);

    // rowDataBound event handler
    const rowDataBound = (args: any) => {
      const rowIndex = Number(args.row.getAttribute("aria-rowindex"));
      if (store && store.nseFetchStore.atmStrikeIndex !== null) {
        const selectedRangeNumber = Number(selectedRange); // Cast selectedRange to a number
        if (
          rowIndex - 1 ===
          store.nseFetchStore.atmStrikeIndex -
            Math.max(
              (store?.nseFetchStore.atmStrikeIndex || 0) - selectedRangeNumber,
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
            store &&
            store.nseFetchStore.atmStrikeIndex !== null &&
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
            selectedRange !== 'All' && 
            store &&
            store.nseFetchStore.atmStrikeIndex !== null &&
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
            const lot_size = store?.nseFetchStore?.lot_size;
            const gammaVolume = rowData[`${type}_totalTradedVolume`] && isFinite(rowData[`${type}_totalTradedVolume`])
              ? (isDividedByLotSize && lot_size && lot_size !== 0
                  ? Math.abs(rowData[`${type}_totalTradedVolume`] / lot_size)
                  : rowData[`${type}_totalTradedVolume`])
              : 'N/A';  // Or any other fallback or default value
      
            return (
              <div>
                <div className={styles.rowNumbers}>
                  {gammaVolume !== 'N/A'
                    ? gammaVolume.toLocaleString()
                    : 'N/A'}
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

      const lot_size = store?.nseFetchStore?.lot_size;

      // const oi = isDividedByLotSize && lot_size && lot_size !== 0 ? rowData['CE_openInterest'] / lot_size : rowData['CE_openInterest'];
      //const changeInOI = isDividedByLotSize && lot_size && lot_size !== 0 ? rowData['CE_changeinOpenInterest'] / lot_size : rowData['CE_changeinOpenInterest'];
      const ce_oi = rowData["CE_openInterest"] && isFinite(rowData["CE_openInterest"])
      ? (isDividedByLotSize && lot_size && lot_size !== 0
          ? Math.abs(rowData["CE_openInterest"] / lot_size)
          : rowData["CE_openInterest"])
      : 0;  // or some other default value or handling

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
      const lot_size = store?.nseFetchStore?.lot_size;

      // const oi = isDividedByLotSize && lot_size && lot_size !== 0 ? rowData['CE_openInterest'] / lot_size : rowData['CE_openInterest'];
      //const changeInOI = isDividedByLotSize && lot_size && lot_size !== 0 ? rowData['CE_changeinOpenInterest'] / lot_size : rowData['CE_changeinOpenInterest'];
      const pe_oi = rowData["PE_openInterest"] && isFinite(rowData["PE_openInterest"])
      ? (isDividedByLotSize && lot_size && lot_size !== 0
          ? Math.abs(rowData["PE_openInterest"] / lot_size)
          : rowData["PE_openInterest"])
      : 0;  // or some other default value or handling

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

    const calculateFairPrice = (data: any, atmStrikePrice: number) => {
      const ceLastPrice = data?.find((row: any) => row.strikePrice === atmStrikePrice)?.CE_lastPrice || 0;
      const peLastPrice = data?.find((row: any) => row.strikePrice === atmStrikePrice)?.PE_lastPrice || 0;
    
      // Calculate the fair price based on CE and PE last prices
      const fairPrice = atmStrikePrice + ceLastPrice - peLastPrice;
      
      return fairPrice;
    };
    

    // helper function to round a value to the nearest half up
    function roundHalfUp(niftyValue: number, base: number) {
      return (
        Math.sign(niftyValue) * Math.round(Math.abs(niftyValue) / base) * base
      );
    }

    const lotSize = store?.nseFetchStore?.lot_size;

    //console.log('Componet store near return', store);

    return (
      <div className={"{styles.flexContainer}fluent-dark"}>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            {/* You can use a spinner component here, or simply a text message */}
            <div className={styles.spinner}></div>
            <p>Loading data, please wait...</p>
          </div>
        ) : (
          <div>
            <div className={styles.actionRow}>
              <div className={styles.eCard} id="basic">
                {(() => {
                  console.log("Prev Instrument Value:", prevInstrumentValue); // Print the current value

                  const data = store?.nseFetchStore?.data;
                  const underlyingValue =
                    data?.[0]?.CE_underlyingValue ||
                    data?.[0]?.PE_underlyingValue ||
                    "N/A";
                  const difference =
                    data && data.length > 0 && "CE_underlyingValue" in data[0]
                      ? data[0].CE_underlyingValue - (prevInstrumentValue || 0)
                      : 0;

                  return (
                    <div>
                      Instrument: {underlyingValue}
                      <span
                        style={{
                          color: difference > 0 ? "darkgreen" : "red",
                          fontSize: "12px",
                          marginLeft: "5px",
                        }}
                      >
                        ({difference.toFixed(2)})
                      </span>
                    </div>
                  );
                })()}
              </div>

              <div className={styles.eCard} id="fairPrice">
                {(() => {
                  // Inside your component, after obtaining the ATM strike price
                  const atmStrikePrice = store?.nseFetchStore.atmStrike || 0;

                  // Call calculateFairPrice with the ATM strike price
                  const fairPrice = calculateFairPrice(store?.nseFetchStore.data, atmStrikePrice);


                  return <div>Fair Price: {fairPrice.toFixed(2)}</div>;
                })()}
              </div>
              <div className={styles.eCardPCR} id="putCallRatio"> 
                  <div>PCR: {pcr}</div>
              </div>
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
                <label htmlFor="fullOI">ALL</label>

                <input
                  type="radio"
                  id="dividedOI"
                  name="displayMode"
                  checked={isDividedByLotSize}
                  onChange={() => setIsDividedByLotSize(true)}
                />
                <label htmlFor="dividedOI">BY LOT</label>
              </div>

              <div className={styles.eCardLot} id="lot_size">
                {(() => {
                  const lot_size = store?.nseFetchStore?.lot_size; // Accessing lotSize from the store

                  return (
                    <div>
                      {/* Display lotSize if it's available */}
                      {lot_size !== null && lot_size !== undefined ? (
                        <p>Lot: {lot_size}</p>
                      ) : (
                        <p>Lot Size is not available</p>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div className={styles.stylebox}>
                {" "}
                {/* This is the new div for selecting range */}
                {[3, 5, 10, 'All'].map((num) => (
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
  value={expiryDate || (expiryDateStore?.expiryDates[0] || '')}
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
                    value={store?.nseFetchStore.symbol || "NIFTY"}
                    change={(e) => {
                      const selectedSymbol = e.value as string;
                      store?.nseFetchStore.setSymbol(selectedSymbol);
                      setIsFetchingExpiryDates(true);
                      expiryDateStore
                        ?.fetchExpiryDatesForSymbol(selectedSymbol)
                        .then(() => {
                          const firstExpiryDate =
                            expiryDateStore.expiryDates[0] || "";
                          setExpiryDate(firstExpiryDate);
                          store?.nseFetchStore.setExpiryDate(firstExpiryDate);
                          if (firstExpiryDate) {
                            store?.nseFetchStore.fetchData(
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

export default NseFlatDataOptions;
