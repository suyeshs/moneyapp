import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { GridComponent, ColumnsDirective, ColumnDirective } from '@syncfusion/ej2-react-grids';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import styles from './syncoptions.module.css';
import { PEData, CEData, ApiResponse } from '../../types';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import path from 'path';
import fs from 'fs';
import { initializeStore, NseStore } from '../../stores/NseStore';

const FlatDataOptions = observer(({ initialData }: { initialData: ApiResponse }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [store, setStore] = useState<NseStore | null>(null);

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

  const ceCellTemplateDelta = (rowData: PEData | CEData) => {
    return (
      <div>
        <div className={styles.rowNumbers}>{rowData.lastPrice}</div>
        <div className={styles.rowNumbers}>Delta: {rowData.delta}</div>
      </div>
    );
  };

  const ceCellTemplateVega = (rowData: CEData) => (
    <div>
      <div className={styles.rowNumbers}>
        {rowData.openInterest} ({rowData.changeinOpenInterest})
      </div>
      <div className={styles.rowNumbers}>Vega: {rowData.vega}</div>
    </div>
  );

  const ceCellTemplateGamma = (rowData: CEData) => (
    <div>
      <div>{rowData.totalTradedVolume}</div>
      <div>Gamma: {rowData.gamma}</div>
    </div>
  );

  const ceCellTemplateTheta = (rowData: CEData) => (
    <div>
      <div>{rowData.impliedVolatility}</div>
      <div>Theta: {rowData.theta}</div>
    </div>
  );

  const peCellTemplateDelta = (rowData: PEData) => (
    <div>
      <div className={styles.rowNumbers}>{rowData.lastPrice}</div>
      <div className={styles.rowNumbers}>Delta: {rowData.delta}</div>
    </div>
  );

  const peCellTemplateVega = (rowData: PEData) => (
    <div>
      <div className={styles.rowNumbers}>
        {rowData.openInterest} ({rowData.changeinOpenInterest})
      </div>
      <div className={styles.rowNumbers}>Vega: {rowData.vega}</div>
    </div>
  );

  const peCellTemplateGamma = (rowData: PEData) => (
    <div>
      <div className={styles.rowNumbers}>{rowData.totalTradedVolume}</div>
      <div className={styles.rowNumbers}>Gamma: {rowData.gamma}</div>
    </div>
  );

  const peCellTemplateTheta = (rowData: PEData) => (
    <div>
      <div className={styles.rowNumbers}>{rowData.impliedVolatility}</div>
    </div>
  );

  const underlyingValue = store?.data?.nse_option_data?.[0]?.underlyingValue;
  console.log('Componet store near return', store);
  return (
    <div className={styles.flexContainer}>
      <div>
        <div className={styles.statusContainer}>
          <div className={styles.eCard} id="basic">
            Last Data Fetch: {store?.lastRefresh || 'N/A'}
          </div>
        </div>
        <div>
          <div className={styles.actionRow}>
            <div className={styles.eCard} id="basic">
              Nifty Value: {underlyingValue || 'N/A'}
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
            dataSource={store?.data?.nse_option_data || []}

            enableHover={false}
            allowSelection={false}
            enableStickyHeader={true}
            queryCellInfo={(args: any) => {
              if (args.column.field === 'strikePrice') {
                args.cell.style.backgroundColor = '#C9C8C8';
              }
            }}
            rowDataBound={(args: any) => {
              if (args.data.strikePrice === store?.closestStrikePrice) {
                args.row.style.backgroundColor = 'yellow';
              }
            }}
          >
            <ColumnsDirective>
              <ColumnDirective headerText=" OI" template={ceCellTemplateVega} />
              <ColumnDirective headerText="VOLUME" template={ceCellTemplateGamma} />
              <ColumnDirective headerText="IV" template={ceCellTemplateTheta} />
              <ColumnDirective headerText="PREMIUM" template={ceCellTemplateDelta} />

              <ColumnDirective
                field="strikePrice"
                headerText="STRIKE PRICE"
                headerTemplate={() => <span className="column-header">STRIKE PRICE</span>}
              />

              <ColumnDirective headerText="PREMIUM" template={peCellTemplateDelta} />
              <ColumnDirective headerText="IV" template={peCellTemplateTheta} />
              <ColumnDirective headerText="VOLUME" template={peCellTemplateGamma} />
              <ColumnDirective headerText="OI" template={peCellTemplateVega} />
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
    const filePath = path.join(process.cwd(), 'src', 'option-data.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(rawData) as ApiResponse;

    return {
      props: {
        initialData: data,
      },
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        error: 'Error fetching data',
      },
    };
  }
};
