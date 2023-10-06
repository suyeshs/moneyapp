import React, { useEffect } from 'react';
import SentimentChart from '../../app/components/SentimentChart/SentimentChart';
import { ChartStore } from '../../stores/ChartStore';
import { NseFetchStore } from '../../stores/NseFetchStore';
import { toJS } from 'mobx';
import { DefaultStore, initializeDefaultStore } from '../../stores/DefaultStore';
import { initializeExpiryDateStore } from '../../stores/ExpiryDateStore';

const SentimentComponent = () => {

// Create an instance of DefaultStore
const defaultStore = initializeDefaultStore();

// Create an instance of ExpiryDateStore
const expiryDateStore = initializeExpiryDateStore();
  
// Create an instance of NseFetchStore
const nseFetchStore = new NseFetchStore(defaultStore, expiryDateStore);

// Create an instance of the ChartStore
const chartStore = new ChartStore(nseFetchStore);

useEffect(() => {
  console.log('chartStore state', toJS(chartStore));
  console.log('Index Graph Data', toJS(chartStore.chartData));
}, [chartStore]);

  useEffect(() => {
    console.log('Index Graph Data', toJS(chartStore.chartData));
  }, [chartStore.chartData]);

  return (
    <div>
      {/* Render the SentimentChart component and pass the chartStore prop */}
      <SentimentChart chartStore={chartStore} />
    </div>
  );
};

export default SentimentComponent;