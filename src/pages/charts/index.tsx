import React from 'react';
import SentimentChart from '../../app/components/SentimentChart/SentimentChart';
import { ChartStore } from '../../stores/ChartStore';
import { toJS } from 'mobx';

const SentimentComponent = () => {
  // Create an instance of the ChartStore
  const chartStore = new ChartStore();

  console.log('Index Graph Data', toJS(chartStore.chartData));

  return (
    <div>
      {/* Render the SentimentChart component and pass the chartStore prop */}
      <SentimentChart chartStore={chartStore} />
    </div>
  );
};

export default SentimentComponent;
