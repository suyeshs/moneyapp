// YourGridComponent.tsx
import React from 'react';
import { observer } from 'mobx-react';
import { GridComponent, ColumnsDirective, ColumnDirective } from '@syncfusion/ej2-react-grids';
import { paytmSocketStore } from '../../../stores/PaytmSocketStore';

const OptionsGrid= observer(() => {
  return (
    <GridComponent 
      dataSource={paytmSocketStore.data}
      allowPaging={true}
      allowSorting={true}
      // Add other grid properties as needed
    >
      <ColumnsDirective>
        {/* Define columns based on your OptionData structure */}
        <ColumnDirective field="strikePrice" headerText="Strike Price" width="100" textAlign="Right" />
        {/* Add more ColumnDirectives for other fields in OptionData */}
      </ColumnsDirective>

      {/* Add other grid functionalities as needed */}
    </GridComponent>
  );
});

export default OptionsGrid;
