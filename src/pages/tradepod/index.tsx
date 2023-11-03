import React from "react";
import { useEffect, useState, useRef } from "react";

import { observer } from "mobx-react-lite";
import { useFeedWorker } from "../../hooks/useFeedWorker";
import { OptionData,OptionDataRow } from "../../types";
import { GridComponent, ColumnDirective } from "../../app/components/DataGrid/DataGridComponenet";
import { paytmSocketStore } from "../../stores/PaytmSocketStore";

const YourComponent = observer(() => {
  const { data } = useFeedWorker();
  

  useEffect(() => {
    if (data && data.length > 0) {
      paytmSocketStore.setData(data);
    } else {
      paytmSocketStore.setLoading(true);
    }
  }, [data]);

   
  
 
  

  return (
    <div>
      <h1>Data Page</h1>
      {!Array.isArray(data) || data.length === 0 ? (
        <p>Loading...</p>
      ) : (
        <GridComponent dataSource={data} enableHover={true}>
  {/* Call Options Section */}
  <ColumnDirective
   
  headerText="Open Interest" 
  template={(rowData: OptionDataRow) => (
    <div>
      <span>{typeof rowData.CE_openInterest === 'number' ? rowData.CE_openInterest : 0}</span>
      <span> ({typeof rowData.CE_changeinOpenInterest === 'number' ? rowData.CE_changeinOpenInterest : 0})</span>
      <div>Vega: {typeof rowData.CE_vega === 'number' ? rowData.CE_vega.toFixed(2) : '0.00'}</div>
    </div>
  )}
/>






  
  <ColumnDirective 
    field="CE_lastPrice" 
    headerText="Last Price"
    template={(rowData: OptionDataRow) => (
      <div>
        <span>{typeof rowData.CE_lastPrice === 'number' ? rowData.CE_lastPrice : 0}</span>

        <div>Delta: {typeof rowData.CE_delta === 'number' ? rowData.CE_delta : 0}</div>
      </div>
    )} 
  />
  <ColumnDirective 
    field="CE_totalTradedVolume" 
    headerText="Volume"
    template={(rowData: OptionDataRow) => (
      <div>
        <span>{typeof rowData.CE_totalTradedVolume === 'number' ? rowData.CE_totalTradedVolume : 0}</span>


        <div>Gamma: {typeof rowData.CE_gamma === 'number' ? rowData.CE_gamma : 0}</div>

      </div>
    )}  
  />
  <ColumnDirective 
    field="CE_impliedVolatility" 
    headerText="Implied Volatility" 
    template={(rowData: OptionDataRow) => (
      <div>
        <span>{typeof rowData.CE_impliedVolatility === 'number' ? rowData.CE_impliedVolatility : 0}</span>


        <div>Theta: {typeof rowData.CE_theta === 'number' ? rowData.CE_theta : 0}</div>

      </div>
    )}  
  />
  
  {/* Strike Price Section */}
  <ColumnDirective 
    field="strikePrice" 
    headerText="Strike Price" 
  />
 

  {/* Put Options Section */}
  <ColumnDirective 
    field="PE_openInterest" 
    headerText="Open Interest"
    template={(rowData: OptionDataRow) => (
      <div>
        <span>{typeof rowData.PE_openInterest === 'number' ? rowData.PE_openInterest : 0}</span>
        <span> ({typeof rowData.PE_changeinOpenInterest === 'number' ? rowData.PE_changeinOpenInterest : 0})</span>
        <div>Vega: {typeof rowData.PE_vega === 'number' ? rowData.PE_vega.toFixed(2) : '0.00'}</div>
      </div>
    )} 
  />
  <ColumnDirective 
    field="PE_changeinOpenInterest" 
    headerText="Change in OI" 
  />
  <ColumnDirective 
    field="PE_lastPrice" 
    headerText="Last Price"
    template={(rowData: OptionDataRow) => (
      <div>
        <span>{typeof rowData.PE_lastPrice === 'number' ? rowData.PE_lastPrice : 0}</span>

        <div>Delta: {typeof rowData.PE_delta === 'number' ? rowData.PE_delta : 0}</div>
      </div>
    )} 
  />
  <ColumnDirective 
    field="PE_totalTradedVolume" 
    headerText="Total Traded Volume"
    template={(rowData: OptionDataRow) => (
      <div>
        <span>{typeof rowData.PE_totalTradedVolume === 'number' ? rowData.PE_totalTradedVolume : 0}</span>


        <div>Gamma: {typeof rowData.PE_gamma === 'number' ? rowData.PE_gamma : 0}</div>

      </div>
    )} 
  />
  <ColumnDirective 
    field="PE_impliedVolatility" 
    headerText="Implied Volatility"
    template={(rowData: OptionDataRow) => (
      <div>
        <span>{typeof rowData.PE_impliedVolatility === 'number' ? rowData.PE_impliedVolatility : 0}</span>


        <div>Theta: {typeof rowData.PE_theta === 'number' ? rowData.PE_theta : 0}</div>

      </div>
    )} 
  />
  
</GridComponent>


      )}
    </div>
  );
});

export default YourComponent;
