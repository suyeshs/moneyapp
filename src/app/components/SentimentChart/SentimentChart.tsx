import React, { useEffect } from 'react';
import { observer } from 'mobx-react';
import {
  ChartComponent,
  SeriesCollectionDirective,
  SeriesDirective,
  Inject,
  StackingBarSeries,
  Category,
  Tooltip,
  ILoadedEventArgs,
  ChartTheme,
  Highlight,
  Zoom,
} from '@syncfusion/ej2-react-charts';
import { ChartStore } from '../../../stores/ChartStore'; // Update the path according to your project structure
import { Browser } from '@syncfusion/ej2-base';

interface SentimentChartProps {
  chartStore: ChartStore;
}

const SentimentChart: React.FC<SentimentChartProps> = observer(({ chartStore }) => {
  useEffect(() => {
    console.log('Sentiment Component',chartStore.chartData); // Add this line
    return () => {
      /* Cleanup code if needed */
    };
  }, []);

  return (
    <div className='control-pane'>
      <div className='control-section'>
        <ChartComponent
          id='charts'
          style={{ textAlign: 'center' }}
          legendSettings={{ enableHighlight: true }}
          primaryXAxis={{
            valueType: 'Category',
            majorGridLines: { width: 0 },
            majorTickLines: { width: 0 }
          }}
          width={Browser.isDevice ? '100%' : '100%'}
          chartArea={{ border: { width: 0 } }}
          primaryYAxis={{
            title: 'Volume',
            lineStyle: { width: 0 },
            majorTickLines: { width: 0 },
            labelFormat: '{value}'
          }}
          tooltip={{ enable: true }}
          zoomSettings={{
            enableMouseWheelZooming: true,
            enablePinchZooming: true,
            enableSelectionZooming: true,
            enableScrollbar: true,
            mode: 'Y'
          }}
        >
          <Inject services={[StackingBarSeries, Category, Tooltip, Highlight, Zoom]} />
          <SeriesCollectionDirective>
  <SeriesDirective
    dataSource={chartStore.chartData.map((item) => ({
      x: item.CE_strikePrice,
      y: item.CE_openInterest
    }))}
    xName='x'
    yName='y'
    border={{ width: 1, color: 'red' }}
    columnWidth={0.6}
    name='CE Open Interest'
    type='StackingBar'
    stackingGroup='group1'
  />
  <SeriesDirective
    dataSource={chartStore.chartData.map((item) => ({
      x: item.CE_strikePrice,
      y: item.CE_changeinOpenInterest,
    }))}
    xName='x'
    yName='y'
    border={{ width: 1, color: 'white' }}
    columnWidth={0.6}
    name='CE Change in OI'
    type='StackingBar'
    stackingGroup='group1'
  />
  <SeriesDirective
    dataSource={chartStore.chartData.map((item) => ({
      x: item.CE_strikePrice,
      y: item.PE_openInterest,
    }))}
    xName='x'
    yName='y'
    border={{ width: 1, color: 'blue' }}
    columnWidth={0.6}
    name='PE Open Interest'
    type='StackingBar'
    stackingGroup='group2'
  />
  <SeriesDirective
    dataSource={chartStore.chartData.map((item) => ({
      x: item.CE_strikePrice,
      y: item.PE_changeinOpenInterest,
    }))}
    xName='x'
    yName='y'
    border={{ width: 1, color: 'green' }}
    columnWidth={0.6}
    name='PE Change in OI'
    type='StackingBar'
    stackingGroup='group2'
  />
</SeriesCollectionDirective>
        </ChartComponent>
      </div>
    </div>
  );
});

export default SentimentChart;