import { makeObservable, observable, action } from 'mobx';
import { NseFetchStore } from './NseFetchStore';

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

    // Retrieve data from local storage on initialization (only on the client-side)
     // Use data from NseFetchStore instead of local storage
     this.setChartData(this.nseFetchStore.data);
     console.log('Index graph data:', this.chartData);
   }

  setChartData(data: ChartData[]) {
    this.chartData = data;

    // Store data in local storage (only on the client-side)
    if (typeof window !== 'undefined') {
      localStorage.setItem('nse_option_data', JSON.stringify(data));
    }
  }
}
