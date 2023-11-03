import React from "react";
import { observer } from "mobx-react-lite";
import { GridComponent, ColumnsDirective, ColumnDirective } from '@syncfusion/ej2-react-grids';
import { useFeedWorker } from "../../hooks/useFeedWorker";
import { OptionData } from "../../types";

const SyncComponent = observer(() => {
  const { data } = useFeedWorker();

  const cellTemplate = (type: 'CE' | 'PE', property: string, rowData: OptionData) => {
    const key = `${type}_${property}` as keyof OptionData;
    if (key in rowData) {
      return <span>{rowData[key]}</span>;
    }
    return <span>Invalid Key</span>;
  };
  

  return (
    <div>
      <h1>Data Page</h1>
      {!Array.isArray(data) || data.length === 0 ? (
        <p>Loading...</p>
      ) : (
        <GridComponent
          dataSource={data}
          enableHover={false}
          allowSelection={false}
          enableStickyHeader={true}
          cssClass="sticky-header-grid"
        >
          <ColumnsDirective>
            <ColumnDirective
              field="CE_openInterest"
              headerText="CE Open Interest"
              template={(rowData: OptionData) => cellTemplate('CE', 'openInterest', rowData)}
              headerTextAlign="Center"
            />
            {/* ...other columns... */}
          </ColumnsDirective>
        </GridComponent>
      )}
    </div>
  );
});

export default SyncComponent;
