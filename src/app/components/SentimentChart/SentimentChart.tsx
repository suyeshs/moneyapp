import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  ChartComponent,
  SeriesCollectionDirective,
  SeriesDirective,
  Category,
  LegendComponent,
  TooltipComponent,
} from '@syncfusion/ej2-react-charts';
import { OptionData } from '../types';
import { useStore } from '../store';

interface SentimentChartProps {
  data: OptionData[];
}

const SentimentChart: React.FC<SentimentChartProps> = observer(({ data }) => {
  return (
    <ChartComponent title="Trader Sentiments" primaryXAxis={{ valueType: 'Category' }} primaryYAxis={{ title: 'Strike Rate' }}>
      <SeriesCollectionDirective>
        <SeriesDirective dataSource={data} xName="volume" yName="strikeRate" type="Bar" fill="green" name="Call Additions" />
        {/* Add more series as needed */}
      </SeriesCollectionDirective>
      <LegendComponent visible={true} />
      <TooltipComponent enable={true} />
    </ChartComponent>
  );
});

export default SentimentChart;
