import React, { useEffect } from 'react';
import { GridComponent, ColumnsDirective, ColumnDirective } from '@syncfusion/ej2-react-grids';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import styles from './syncoptions.module.css';
import { optionStore } from '../../stores/OptionStore';
import { observer } from 'mobx-react';

const BreezeSyncOptions: React.FC = observer(() => {

  useEffect(() => {
    optionStore.startFetchingData();

    return () => {
      optionStore.stopFetchingData();
    };  
  }, []);

  // queryCellInfo event handler
const queryCellInfo = (args: any) => {
  // Array of the names of the columns for which you want to change the cell color
  const ceColumns = ['callOption_open_interest', 'callOption_total_quantity_traded', 'callOption_iv', 'callOption_ltp'];
  const peColumns = ['putOption_open_interest', 'putOption_total_quantity_traded', 'putOption_iv', 'putOption_ltp'];

  // Check if the current cell's column is in the array
  if (ceColumns.includes(args.column.field)) {
    // Get the rowIndex of the current cell
    const rowIndex = Number(args.cell.parentElement.getAttribute('aria-rowindex'));

    // Check the condition for which you want to change the color
    if (optionStore && optionStore.atmStrikeIndex !== null && rowIndex - 1 < optionStore.atmStrikeIndex) {
      args.cell.style.background = 'lightyellow';
    }
  }
  
  if (peColumns.includes(args.column.field)) {
    // Get the rowIndex of the current cell
    const rowIndex = Number(args.cell.parentElement.getAttribute('aria-rowindex'));

    // Check the condition for which you want to change the color
    if (optionStore && optionStore.atmStrikeIndex !== null && rowIndex - 1 > optionStore.atmStrikeIndex) {
      args.cell.style.background = 'lightyellow';
    }
  }

  if (args.column.field === 'strikePrice') {
    args.cell.style.backgroundColor = '#C9C8C8';
  }

  // Center align the content in all columns
  args.cell.style.textAlign = 'center';
};

function formatNumberWithSeparator(number: number): string {
  return number.toLocaleString('en-IN');
}


  const ceCellTemplateDelta = (rowData: any) => (
    <div>
      <div className={styles.rowNumbers}>{rowData.callOption.ltp}</div>
      <div className={styles.rowNumbers}>Delta: {rowData.callOption.delta}</div>
    </div>
  );

  const peCellTemplateDelta = (rowData: any) => (
    <div>
      <div>{rowData.putOption?.lastPrice}</div>
      <div>Delta: {rowData.putOption?.delta}</div>
    </div>
  );

  return (
    <div className={styles.flexContainer}>
      <div>
      <div className={styles.actionRow}>
    <div className={styles.eCard} id="basic">
        <div> 
          Nifty Value {optionStore.data?.[0]?.callOption?.spot_price || optionStore.data?.[0]?.putOption?.spot_price || 'N/A'}
        </div>
    </div>
    <div>
        <DropDownListComponent id="ddlelement" placeholder="Select an Instruments" />
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
        <div className={styles.gridContainer}>
          {(optionStore.data.length > 0) && (
            <GridComponent dataSource={optionStore.data} allowSorting={true} queryCellInfo={queryCellInfo}>
              <ColumnsDirective>
                <ColumnDirective field="callOption.open_interest" headerText="OI"  headerTextAlign="Center" />
                <ColumnDirective field="callOption.total_quantity_traded" headerText="VOLUME"  headerTextAlign="Center" />
                <ColumnDirective field="callOption.iv" headerText="IV" headerTextAlign="Center" />
                <ColumnDirective field="callOption.ltp" headerText="PREMIUM" template={ceCellTemplateDelta} headerTextAlign="Center" />
                <ColumnDirective field="strikePrice" headerText="STRIKE PRICE" headerTextAlign="Center" />
                <ColumnDirective field="putOption.ltp" headerText="PREMIUM" template={peCellTemplateDelta} headerTextAlign="Center" />
                <ColumnDirective field="putOption.iv" headerText="IV" headerTextAlign="Center" />
                <ColumnDirective field="putOption.total_quantity_traded" headerText="VOLUME" headerTextAlign="Center" />
                <ColumnDirective field="putOption.open_interest" headerText="OI"  headerTextAlign="Center" />
              </ColumnsDirective>
            </GridComponent>
          )}
        </div>
      </div>
    </div>
  );
});

export default BreezeSyncOptions;
