import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { GridComponent, ColumnsDirective, ColumnDirective } from '@syncfusion/ej2-react-grids';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import styles from './syncoptions.module.css';
import { ApiResponse, OptionChainData,OptionData} from '../../types';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import { initializeStore, NseStore } from '../../stores/NseStore';
import { useRef } from 'react';



const FlatDataOptions = observer(({ initialData }: { initialData: OptionData[] }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [store, setStore] = useState<NseStore | null>(null);
  const gridRef = useRef<GridComponent | null>(null);
  useEffect(() => {
    initializeStore(initialData).then((initializedStore) => {
      setStore(initializedStore);
      setIsLoading(false);
    });
  }, [initialData]);
  if (isLoading) {
    // Show a loading spinner or placeholder while the store is being initialized
    return <div>Loading...</div>;
  }
 
// queryCellInfo event handler
const queryCellInfo = (args: any) => {
  // Array of the names of the columns for which you want to change the cell color
  const ceColumns = ['CE_OI', 'CE_VOLUME', 'CE_IV', 'CE_PREMIUM'];
  const peColumns = ['PE_OI', 'PE_VOLUME', 'PE_IV', 'PE_PREMIUM'];
  // Check if the current cell's column is in the array
  if (ceColumns.includes(args.column.field)) {
    // Get the rowIndex of the current cell
    const rowIndex = Number(args.cell.parentElement.getAttribute('aria-rowindex'));
    
    // Check the condition for which you want to change the color
    // For example, if rowIndex - 1 is less than store.atmStrikeIndex
    if (store && store.atmStrikeIndex !== null && rowIndex - 1 < store.atmStrikeIndex) {
      args.cell.style.background = 'lightyellow';
    }
  }
  if (peColumns.includes(args.column.field)) {
    // Get the rowIndex of the current cell
    const rowIndex = Number(args.cell.parentElement.getAttribute('aria-rowindex'));
    
    // Check the condition for which you want to change the color
    // For example, if rowIndex - 1 is less than store.atmStrikeIndex
    if (store && store.atmStrikeIndex !== null && rowIndex - 1 > store.atmStrikeIndex) {
      args.cell.style.background = 'lightyellow';
    }
  }
  if (args.column.field === 'strikePrice') {
    args.cell.style.backgroundColor = '#C9C8C8';
  }
   // Center align the content in all columns
  args.cell.style.textAlign = 'center';
};

  const ceCellTemplateDelta = (rowData: any ) => (
    <div>
      <div className={styles.rowNumbers}>  {rowData.CE_lastPrice}</div>
      <div className={styles.rowNumbers}>Delta: {rowData.CE_delta}</div>
    </div>
  );
  
  const ceCellTemplateVega = (rowData: any) => (
    <div>
      <div className={styles.rowNumbers}>
        {rowData.CE_openInterest} ({rowData.CE_changeinOpenInterest})
      </div>
      <div className={styles.rowNumbers}>Vega: {rowData.CE_vega}</div>
    </div>
  );

  const ceCellTemplateGamma = (rowData: any) => (
    <div>
      <div>{rowData.CE_totalTradedVolume}</div>
      <div>Gamma: {rowData.CE_gamma}</div>
    </div>
  );

  const ceCellTemplateTheta = (rowData: any) => (
    <div>
      <div>{rowData.CE_impliedVolatility}</div>
      <div>Theta: {rowData.CE_theta}</div>
    </div>
  );

  const peCellTemplateDelta = (rowData: any) => (
    <div>
      <div className={styles.rowNumbers}>{rowData.PE_lastPrice}</div>
      <div className={styles.rowNumbers}>Delta: {rowData.PE_delta}</div>
    </div>
  );

  const peCellTemplateVega = (rowData: any) => (
    <div>
      <div className={styles.rowNumbers}>
        {rowData.openInterest} ({rowData.PE_changeinOpenInterest})
      </div>
      <div className={styles.rowNumbers}>Vega: {rowData.PE_vega}</div>
    </div>
  );

  const peCellTemplateGamma = (rowData: any) => (
    <div>
      <div className={styles.rowNumbers}>{rowData.PE_totalTradedVolume}</div>
      <div className={styles.rowNumbers}>Gamma: {rowData.PE_gamma}</div>
    </div>
  );

  const peCellTemplateTheta = (rowData: any) => (
    <div>
      <div className={styles.rowNumbers}>{rowData.PE_impliedVolatility}</div>
      <div>Theta: {rowData.PE_theta}</div>
    </div>
  );
  


// helper function to round a value to the nearest half up
function roundHalfUp(niftyValue: number, base: number) {
  return Math.sign(niftyValue) * Math.round(Math.abs(niftyValue) / base) * base;
}

// rowDataBound event handler
const rowDataBound = (args: any) => {
  console.log('ATM Strike', store?.atmStrikeIndex);
  const rowIndex = Number(args.row.getAttribute('aria-rowindex'));
  if (store && store.atmStrikeIndex !== null) {
    if (rowIndex - 1 === store.atmStrikeIndex) {
      args.row.style.background = 'yellow';
    }
  }


  
};


  
// Assuming `store` is an instance of `NseStore` or null.
if(store !== null) {
  const rowData = store.getDataAtIndex(48);
  if(rowData !== null) {
    console.log('Index 48',rowData);
  }
} else {
  console.log('Store is not initialized');
}



  

  
  console.log('Componet store near return', store);
  let maxIndex = store?.closestStrikePriceIndex;
  return (
    <div className={styles.flexContainer}>
      <div>
        
        <div>
          <div className={styles.actionRow}>
            <div className={styles.eCard} id="basic">
            Nifty Value: {store?.data?.[0]?.CE_underlyingValue || store?.data?.[0]?.PE_underlyingValue || 'N/A'}
            </div>
            <div>
              <DropDownListComponent id="ddlelement" placeholder="Select an Instrument" />
            </div>
            <div>
              <DropDownListComponent
                id="ddlelement"
                allowFiltering={true}
                popupHeight="250px"
                placeholder="Select an Instrument"
              />
            </div>
          </div>
          
          <GridComponent
            ref={gridRef}
            dataSource={store?.data || []}
            rowDataBound={rowDataBound}
            enableHover={false}
            allowSelection={false}
            enableStickyHeader={true}
            cssClass="sticky-header-grid" // Add the CSS class here
            queryCellInfo={queryCellInfo}
            
          >
            <ColumnsDirective>
              <ColumnDirective field="CE_OI" headerText=" OI" template={ceCellTemplateVega} headerTextAlign="Center" />
              <ColumnDirective field="CE_VOLUME" headerText="VOLUME" template={ceCellTemplateGamma} headerTextAlign="Center" />
              <ColumnDirective field="CE_IV" headerText="IV" template={ceCellTemplateTheta} headerTextAlign="Center" />
              <ColumnDirective field="CE_IV" headerText="PREMIUM" template={ceCellTemplateDelta} headerTextAlign="Center" />

              <ColumnDirective
                field="strikePrice"
                headerText="STRIKE PRICE"
                headerTextAlign="Center" // Center align the header text
              />

              <ColumnDirective field="PE_PREMIUM"headerText="PREMIUM" template={peCellTemplateDelta} headerTextAlign="Center" />
              <ColumnDirective field="PE_IV"headerText="IV" template={peCellTemplateTheta} headerTextAlign="Center"/>
              <ColumnDirective field="PE_VOLUME"headerText="VOLUME" template={peCellTemplateGamma} headerTextAlign="Center"/>
              <ColumnDirective field="PE_OI"headerText="OI" template={peCellTemplateVega} headerTextAlign="Center"/>
            </ColumnsDirective>
          </GridComponent>
        </div>
      </div>
    </div>
  );
});

export default FlatDataOptions;

// Your getServerSideProps function

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/option-chain-copy?stock_code=NIFTY&expiry_date=13-JUL-2023');
    const data = response.data as ApiResponse;

    const flattenRecord = (record: OptionChainData): OptionData => {
      return {
        expiryDate: record.expiryDate,
        strikePrice: record.strikePrice,
        // Call Option Data
        CE_openInterest: record.CE?.openInterest,
        CE_changeinOpenInterest: record.CE?.changeinOpenInterest,
        CE_totalTradedVolume: record.CE?.totalTradedVolume,
        CE_impliedVolatility: record.CE?.impliedVolatility,
        CE_lastPrice: record.CE?.lastPrice,
        CE_vega: record.CE?.vega,
        CE_gamma: record.CE?.gamma,
        CE_theta: record.CE?.theta,
        CE_delta: record.CE?.delta,
        CE_underlyingValue: record.CE?.underlyingValue,
        // Put Option Data
        PE_openInterest: record.PE?.openInterest,
        PE_lastPrice: record.PE?.lastPrice,
        PE_totalTradedVolume: record.PE?.totalTradedVolume,
        PE_impliedVolatility: record.PE?.impliedVolatility,
        PE_changeinOpenInterest: record.PE?.changeinOpenInterest,
        PE_vega: record.PE?.vega,
        PE_gamma: record.PE?.gamma,
        PE_theta: record.PE?.theta,
        PE_delta: record.PE?.delta,
        PE_underlyingValue: record.PE?.underlyingValue,
      };
    };
    
    if (data && data.nse_option_data) { 
      const flattenedData: OptionData[] = data.nse_option_data.map(flattenRecord);
      console.log('Flattened data:', flattenedData);

      return {
        props: {
          initialData: flattenedData,
        },
      };
    } else {
      throw new Error(' or data.nse_option_data is undefined');
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error parsing stored data:', error.message);
    } else {
      throw error;
    }
      
    // You need to return something in case of error, or Next.js will complain
    // that you didn't return anything. Here we return empty props.
    return {
      props: {}
    };
  }
};





















