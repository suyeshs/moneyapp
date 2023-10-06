import { observer } from 'mobx-react';
import { useEffect, useState, useRef } from 'react';
import { GridComponent, ColumnsDirective, ColumnDirective } from '@syncfusion/ej2-react-grids';
import styles from './syncoptions.module.css';
import { NseOptionData } from '../../types';
import { DataManager, UrlAdaptor,  } from '@syncfusion/ej2-data';
import { initializeNseFetchStore, NseFetchStore } from '../../stores/NseFetchStore';
import { DropDownListComponent, MultiSelectComponent} from '@syncfusion/ej2-react-dropdowns';
import { initializeExpiryDateStore, ExpiryDateStore } from '../../stores/ExpiryDateStore';
import { initializeSymbolStore, SymbolStore } from '../../stores/SymbolsStore';
import { DefaultStore } from '../../stores/DefaultStore';


const NseFlatDataOptions = observer(({ initialData, initialStock }: { initialData: NseOptionData[], initialStock: string }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [store, setStore] = useState<{ nseFetchStore: NseFetchStore } | null>(null);
  const [selectedRange, setSelectedRange] = useState(5);
  const gridRef = useRef<GridComponent | null>(null);
  const [expiryDateStore, setExpiryDateStore] = useState<ExpiryDateStore | null>(null);
  const [expiryDate, setExpiryDate] = useState('');
  const [userSelectedStock, setUserSelectedStock] = useState(initialStock || '');
  // Add a new state to store the selected expiry dates
  const [selectedExpiryDates, setSelectedExpiryDates] = useState<string[]>([]);
  // Add a new state to store the previous instrument value
  const [prevInstrumentValue, setPrevInstrumentValue] = useState<number | null>(null);
  const [isFetchingExpiryDates, setIsFetchingExpiryDates] = useState(false);
  
  const dataManager = new DataManager({
    json: initialData,
    adaptor: new UrlAdaptor(), 
  });
  const [symbolStore, setSymbolStore] = useState<{ symbolStore: SymbolStore } | null>(null);
  const onUserSelectDate = (newDate: string) => {
    console.log(`Expiry date changed to: ${newDate}`); // Log the new expiry date
    // Update expiryDate in the store
    store?.nseFetchStore.setExpiryDate(newDate);
  
    // Fetch new data based on the updated expiryDate and the currently selected stock
    store?.nseFetchStore.fetchData(userSelectedStock, newDate);
  };
  

  useEffect(() => {
    const symbolStoreInstance = initializeSymbolStore();
symbolStoreInstance.symbolStore.fetchSymbols().then(() => {
  setSymbolStore({ symbolStore: symbolStoreInstance.symbolStore });
});
  }, []);

  const fetchExpiryDatesAndData = async (symbol: string, expiryDateStore: ExpiryDateStore, nseFetchStore: NseFetchStore) => {
    await expiryDateStore.fetchExpiryDatesForSymbol(symbol);
    const firstExpiryDate = expiryDateStore.expiryDates[0] || '';
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
      defaultStore.setSymbol('NIFTY');
      await expiryDateStoreInstance.fetchExpiryDatesForSymbol('NIFTY');
      console.log('Fetched expiry dates:', expiryDateStoreInstance.expiryDates); // Debug line
      const firstExpiryDate = expiryDateStoreInstance.expiryDates[0] || '';
      console.log('Setting expiry date to:', firstExpiryDate); // Debug line
      await defaultStore.setExpiryDate(firstExpiryDate);
  
      // Now initialize NseFetchStore with the DefaultStore instance
      const nseFetchStoreInstance = initializeNseFetchStore(defaultStore, expiryDateStoreInstance, initialData);
      setStore({ nseFetchStore: nseFetchStoreInstance });
    };
  
    initializeStores();
  }, [initialData, initialStock]);
  
  useEffect(() => {
    if (expiryDateStore && store?.nseFetchStore) {
      fetchExpiryDatesAndData(userSelectedStock || 'NIFTY', expiryDateStore, store.nseFetchStore);
    }
  }, [userSelectedStock, expiryDateStore, store]);

  useEffect(() => {
    // Get the current instrument value
    const currentInstrumentValue = store?.nseFetchStore.data?.[0]?.CE_underlyingValue || store?.nseFetchStore.data?.[0]?.PE_underlyingValue || null;

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




  const atmIndex = store?.nseFetchStore.atmStrikeIndex || 0;
  const startSliceIndex = Math.max(atmIndex - selectedRange, 0); // Updated to use selectedRange
  console.log('Start Slice Index:', startSliceIndex);
  const displayData = store?.nseFetchStore.data ? store.nseFetchStore.data.slice(startSliceIndex, atmIndex + selectedRange + 1) : [];
  const totalCE_openInterest = displayData.reduce((total, row) => total + (row.CE_openInterest || 0), 0);
  const totalCE_totalTradedVolume = displayData.reduce((total, row) => total + (row.CE_totalTradedVolume || 0), 0);
  const totalPE_openInterest = displayData.reduce((total, row) => total + (row.PE_openInterest || 0), 0);
  const totalPE_totalTradedVolume = displayData.reduce((total, row) => total + (row.PE_totalTradedVolume || 0), 0);
  // This calculates the ATM's index within the `displayData` array
  const newATMIndex = atmIndex - startSliceIndex;

  console.log('Store:', store?.nseFetchStore);
  console.log('ATM Strike Index:', store?.nseFetchStore.atmStrikeIndex);
  console.log('Data Length:', store?.nseFetchStore.data.length);

// rowDataBound event handler
const rowDataBound = (args: any) => {
  const rowIndex = Number(args.row.getAttribute('aria-rowindex'));
  const atmStrikeIndex = store?.nseFetchStore.atmStrikeIndex || 0;
  if (rowIndex - 1 === (atmStrikeIndex - Math.max(atmStrikeIndex - selectedRange, 0))) {
    args.row.style.background = 'beige';
  }
};

// queryCellInfo event handler
const queryCellInfo = (args: any) => {
  const ceColumns = ['CE_OI', 'CE_VOLUME', 'CE_IV', 'CE_PREMIUM'];
  const peColumns = ['PE_OI', 'PE_VOLUME', 'PE_IV', 'PE_PREMIUM'];
  const atmStrikeIndex = store?.nseFetchStore.atmStrikeIndex || 0;

  if (args.cell.parentElement) {
    const rowIndex = Number(args.cell.parentElement.getAttribute('aria-rowindex'));
    if (ceColumns.includes(args.column.field) && rowIndex - 1 < newATMIndex) {
      args.cell.style.background = 'lightgrey';
    }
    if (peColumns.includes(args.column.field) && rowIndex - 1 > atmStrikeIndex) {
      args.cell.style.background = 'lightgrey';
    }
  }

  if (args.column.field === 'strikePrice') {
    args.cell.style.backgroundColor = '#C9C8C8';
  }

  args.cell.style.textAlign = 'center';
};

function formatNumberWithSeparator(number: number): string {
  return number.toLocaleString('en-IN');
}

const cellTemplate = (type: 'CE' | 'PE', property: 'Delta' | 'Vega' | 'Gamma' | 'Theta', rowData: any) => {
  const openInterest = Number(rowData[`${type}_openInterest`]);
  const changeInOpenInterest = Number(rowData[`${type}_changeinOpenInterest`]);
  switch (property) {
    case 'Delta':
      return (
        <div>
          <div className={styles.rowNumbers}>{rowData[`${type}_lastPrice`]}</div>
          <div className={styles.rowNumbers}>Delta: {rowData[`${type}_delta`] ? Number(rowData[`${type}_delta`]).toFixed(2) : 'N/A'}</div>
        </div>
      );
    case 'Vega':
      return type === 'CE' ? ceVega(rowData) : peVega(rowData);
    case 'Gamma':
      return (
        <div>
          <div className={styles.rowNumbers}>{rowData[`${type}_totalTradedVolume`]}</div>
          <div className={styles.greekNumbers}>Gamma: {Number(rowData[`${type}_gamma`]).toFixed(4)}</div>
        </div>
      );
    case 'Theta':
      return (
        <div>
          <div className={styles.rowNumbers}>{rowData[`${type}_impliedVolatility`]}</div>
          <div className={styles.rowNumbers}>{rowData[`${type}_calcIV`]}</div>
          <div className={styles.greekNumbers}>Theta: {rowData[`${type}_theta`]}</div>
        </div>
      );
  }
};

const ceVega = (rowData: any) => vega('CE', rowData);
const peVega = (rowData: any) => vega('PE', rowData);

const vega = (type: 'CE' | 'PE', rowData: any) => {
  const color = rowData[`${type}_changeinOpenInterest`] > 0 ? 'green' : 'red';
  const changeInOI = Math.abs(rowData[`${type}_changeinOpenInterest`]);
  const maxSize = 10000;
  const size = Math.min(changeInOI / maxSize * 5, 100);
  const progressStyle = {
    backgroundColor: color === 'green' ? '#77AE57' : '#ff0000',
    width: `${size}%`,
    height: '18px',
    marginRight: `${100 - size}%`,
    borderRadius: '0px 25px 25px 0px',
  };

  return (
    <div style={{ position: 'relative' }}>
      <div className={`${styles.rowNumbers} ${styles.progressBar}`}>
        <div className={styles.progressBarValue} style={progressStyle}></div>
      </div>
      <div style={{ position: 'absolute', top: '25%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', textAlign: 'center' }}>
        {rowData[`${type}_openInterest`]} ({rowData[`${type}_changeinOpenInterest`]})
      </div>
      <div className={styles.greekNumbers}>Vega: {rowData[`${type}_vega`]}</div>
    </div>
  );
};

// helper function to round a value to the nearest half up
function roundHalfUp(niftyValue: number, base: number) {
  return Math.sign(niftyValue) * Math.round(Math.abs(niftyValue) / base) * base;
}

let sortedData = [...displayData].sort((a, b) => a.strikePrice - b.strikePrice);
  





  //console.log('Componet store near return', store);
  

  return (
    <div className={'{styles.flexContainer}fluent-dark'}> 

      {isLoading ? (
        <div className={styles.loadingContainer}>
          {/* You can use a spinner component here, or simply a text message */}
          <div className={styles.spinner}></div>
          <p>Loading data, please wait...</p>
        </div>
      ) : (
        <div>
          <div className= {styles.actionRow}>
          <div className={styles.eCard} id="basic">
              {
                (() => {
                  const data = store?.nseFetchStore?.data;
                  const underlyingValue = data?.[0]?.CE_underlyingValue || data?.[0]?.PE_underlyingValue || 'N/A';
                  const difference = data && data.length > 0 && 'CE_underlyingValue' in data[0] 
                    ? data[0].CE_underlyingValue - (prevInstrumentValue || 0)
                    : 0;

                  return (
                    <div>
                      Instrument: {underlyingValue} 
                      <span style={{ color: difference > 0 ? 'darkgreen' : 'red', fontSize: '12px', marginLeft: '5px' }}>
                      ({difference.toFixed(2)})
                      </span>
                    </div>
                  );
                })()
              }
            </div>

            <div className={styles.stylebox}> {/* This is the new div for selecting range */}
              {[3,5,10].map(num => (
                <div
                  key={num}
                  className={`${styles.box} ${selectedRange === num ? styles.selectedBox : ''}`}
                  onClick={() => setSelectedRange(num)}>
                  {num}
                </div>
              ))}
            </div>

            <div>
            <DropDownListComponent
              placeholder="Select Expiry Dates"
              dataSource={expiryDateStore?.expiryDates || []}
              value={expiryDate}
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
    expiryDateStore?.fetchExpiryDatesForSymbol(selectedSymbol).then(() => {
      const firstExpiryDate = expiryDateStore.expiryDates[0] || '';
      setExpiryDate(firstExpiryDate);
      store?.nseFetchStore.setExpiryDate(firstExpiryDate);
      if (firstExpiryDate) {
        store?.nseFetchStore.fetchData(selectedSymbol, firstExpiryDate);
      }
      setIsFetchingExpiryDates(false);
    });
  }}
  enabled={expiryDate !== ''}
/>
)}
            </div>
            <div>
            <MultiSelectComponent
  placeholder="Select Expiry Dates"
  dataSource={expiryDateStore?.expiryDates || []}
  mode="Box"
  change={(e) => {
    const selectedDates = e.value as string[];
    if (selectedDates.length > 2) {
      alert('You can only select a maximum of two expiry dates.');
      return;
    }
    setSelectedExpiryDates(selectedDates);
  }}
/>


              


            </div>
          </div>

          <div>
         

            <GridComponent
              ref={gridRef}
              dataSource={sortedData || []}
              rowDataBound={rowDataBound}
              enableHover={false}
              allowSelection={false}
              enableStickyHeader={true}
              cssClass="sticky-header-grid"
              queryCellInfo={queryCellInfo}
              sortSettings={{ columns: [{ field: 'strikePrice', direction: 'Ascending' }] }}

            >
              <ColumnsDirective>
                <ColumnDirective field="CE_OI" headerText=" OI" template={(rowData: any) => cellTemplate('CE', 'Vega', rowData)} headerTextAlign="Center" />
                <ColumnDirective field="CE_VOLUME" headerText="VOLUME" template={(rowData: any) => cellTemplate('CE', 'Gamma', rowData)} headerTextAlign="Center" />
                <ColumnDirective field="CE_IV" headerText="IV" template={(rowData: any) => cellTemplate('CE', 'Theta', rowData)} headerTextAlign="Center" />
                <ColumnDirective field="CE_IV" headerText="PREMIUM" template={(rowData: any) => cellTemplate('CE', 'Delta', rowData)} headerTextAlign="Center" />

                <ColumnDirective field="strikePrice" headerText="STRIKE PRICE" headerTextAlign="Center" />

                <ColumnDirective field="PE_PREMIUM" headerText="PREMIUM" template={(rowData: any) => cellTemplate('PE', 'Delta', rowData)} headerTextAlign="Center" />
                <ColumnDirective field="PE_IV" headerText="IV" template={(rowData: any) => cellTemplate('PE', 'Theta', rowData)} headerTextAlign="Center" />
                <ColumnDirective field="PE_VOLUME" headerText="VOLUME" template={(rowData: any) => cellTemplate('PE', 'Gamma', rowData)} headerTextAlign="Center" />
                <ColumnDirective field="PE_OI" headerText="OI" template={(rowData: any) => cellTemplate('PE', 'Vega', rowData)} headerTextAlign="Center" />
              </ColumnsDirective>
              
            </GridComponent>
          </div>
          <div>
            <p>Total CE Open Interest: {totalCE_openInterest}</p>
            <p>Total CE Total Traded Volume: {totalCE_totalTradedVolume}</p>
            <p>Total PE Open Interest: {totalPE_openInterest}</p>
            <p>Total PE Total Traded Volume: {totalPE_totalTradedVolume}</p>
          </div>
        </div>
      )}
    </div>
  );
});

export default NseFlatDataOptions;