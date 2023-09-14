/**
 * Sample for stackingBar series
 */
import * as React from "react";
import {
    ChartComponent,
    SeriesCollectionDirective,
    SeriesDirective,
    Inject,
    Legend,
    Category,
    StackingBarSeries,
    Tooltip,
    ILoadedEventArgs,
    ChartTheme,
    Highlight
} from '@syncfusion/ej2-react-charts';

import { Browser } from '@syncfusion/ej2-base';
import { toJS } from 'mobx';
import { ChartStore } from '../../../stores/ChartStore';
import { GraphData } from '../../../types';

export let data: any[] = [
    { x: '18500', y: 358214  },
    { x: '18550', y: 208011  },
    { x: '18600', y: 251633  },
    { x: '18650', y: 173589  },
    { x: '18700', y: 258150  },
    { x: '18750', y: 96039  }
];
export let data2: any[] = [
    { x: '18500', y: 190654 },
    { x: '18550', y: 112041 },
    { x: '18600', y: 101451 },
    { x: '18650', y: 79726 },
    { x: '18700', y: 59579 },
    { x: '18750', y: 44732 }
];


const SAMPLE_CSS = `
    .control-fluid {
		padding: 0px !important;
    }`;

export class StackedBar extends React.Component {

  public onChartLoad(args: ILoadedEventArgs): void {
    const chart = document.getElementById('charts');
    if (chart) {
        chart.setAttribute('title', '');
    }
};

public load(args: ILoadedEventArgs): void {
    const selectedTheme = location.hash.split('/')[1];
    const theme = selectedTheme ? selectedTheme : 'Material';
    args.chart.theme = (theme.charAt(0).toUpperCase() + theme.slice(1)) as ChartTheme;
};

public render() {
  return (
      <div className='control-pane'>
          <style>{SAMPLE_CSS}</style>
          <div className='control-section'>
              <ChartComponent
                  id='charts'
                  style={{ textAlign: 'center' }}
                  legendSettings={{ enableHighlight: true }}
                  primaryXAxis={{
                      valueType: 'Category',
                      majorGridLines: { width: 0 },
                      majorTickLines: { width: 0 },
                  }}
                  width={Browser.isDevice ? '100%' : '75%'}
                  chartArea={{ border: { width: 0 } }}
                  primaryYAxis={{
                      title: 'Volume',
                      lineStyle: { width: 0 },
                      majorTickLines: { width: 0 },
                      edgeLabelPlacement: 'Shift'
                  }}
                  load={this.load.bind(this)}
                  title='Options Sentiments'
                  loaded={this.onChartLoad.bind(this)}
                  tooltip={{ enable: true }}
              >
                  <Inject
                      services={[
                          StackingBarSeries,
                          Category,
                          Legend,
                          Tooltip,
                          Highlight
                      ]}
                  />
                  <SeriesCollectionDirective>
                      <SeriesDirective
                          dataSource={data}
                          width={2}
                          xName='x'
                          yName='y'
                          border={{ width: 1, color: 'white' }}
                          columnWidth={0.6}
                          name='CE Open Interest'
                          type='StackingBar'
                      />
                      <SeriesDirective
                          dataSource={data2}
                          width={2}
                          xName='x'
                          yName='y'
                          border={{ width: 1, color: 'white' }}
                          columnWidth={0.6}
                          name='Orange'
                          type='StackingBar'
                      />
                  </SeriesCollectionDirective>
              </ChartComponent>
          </div>
      </div>
  );
}
}

export default StackedBar;
