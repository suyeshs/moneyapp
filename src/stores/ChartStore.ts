import { makeObservable, observable, action } from 'mobx';
import { NseFetchStore } from './NseFetchStore';
import {NseOptionData} from '../types';

interface ChartData {
  CE_strikePrice: number;
  CE_openInterest: number;
  CE_changeinOpenInterest: number;
  PE_strikePrice: number;
  PE_openInterest: number;
  PE_changeinOpenInterest: number;
}

export class ChartStore {
  chartData: ChartData[] = [];
  private nseFetchStore: NseFetchStore;

  constructor(nseFetchStore: NseFetchStore) {
    this.nseFetchStore = nseFetchStore;
    makeObservable(this, {
      chartData: observable,
      setChartData: action,
    });

    this.nseFetchStore.fetchData().then((data: NseOptionData[]) => {

      console.log('Data from nseFetchStore:', data);
      const chartData: ChartData[] = data.map(item => ({
        CE_strikePrice: item.strikePrice,
        CE_openInterest: item.CE_openInterest,
        CE_changeinOpenInterest: item.CE_changeinOpenInterest,
        PE_strikePrice: item.strikePrice,
        PE_openInterest: item.PE_openInterest,
        PE_changeinOpenInterest: item.PE_changeinOpenInterest,
      }));

      this.setChartData(chartData);
      console.log('Index graph data:', this.chartData);
    });
  }

  setChartData(data: ChartData[]) {
    this.chartData = data;
  }
}