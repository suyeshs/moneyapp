import { makeObservable, observable, action } from 'mobx';
import { ApiResponse } from '@/types';



export class NseStore {
  data: ApiResponse | null = null;
  expiryDates: string[] = [];
  error: string | null = null;
  lastRefresh: string = '';
  maxCE_OIIndex: number = 0;
  isLoading: boolean = false;
  closestStrikePrice: number = 0;
  

  constructor(initialData?: ApiResponse) {
    makeObservable(this, {
      data: observable,
      expiryDates: observable,
      error: observable,
      lastRefresh: observable,
      maxCE_OIIndex: observable,
      isLoading: observable,
      closestStrikePrice: observable,
      setData: action,
      setLastRefresh: action,
      calculateMaxCE_OIIndex: action,
    });

    if (initialData) {
      this.setData(initialData);
      console.log('Initial data set:', this.data);
    }
  }

  setData(data: ApiResponse): void {
    console.log('setData:', data);
    if (this.data !== data) {
      this.data = data;
      console.log('data', this.data);
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem('nse_option_data', JSON.stringify(this.data));
          console.log('nse_option_data set in localStorage:', this.data);
        } catch (error) {
          console.error('Error setting data in localStorage:', error);
        }
      }
    }
  }

  setLastRefresh(lastRefresh: string): void {
    this.lastRefresh = lastRefresh;
    console.log('setLastRefresh:', this.lastRefresh);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('lastFetchTime', this.lastRefresh);
    }
  }

  calculateMaxCE_OIIndex(): void {
    if (this.data && this.data.nse_option_data.length > 0) {
      const index = this.data.nse_option_data.reduce(
        (maxIndex, item, index, arr) =>
          (item.CE?.openInterest ?? 0) > (arr[maxIndex].CE?.openInterest ?? 0) ? index : maxIndex,
        0
      );
      this.maxCE_OIIndex = index;
      console.log('calculateMaxCE_OIIndex:', index);
    }
  }
}

let store: NseStore | null = null;

export function initializeStore(initialData?: ApiResponse): Promise<NseStore> {
  return new Promise((resolve) => {
    if (store === null || typeof window === 'undefined') {
      store = new NseStore(initialData);
    }

    if (initialData && store !== null) {
      store.setData(initialData);
    }

    // Check if stored data is available and set it in the store
    if (typeof localStorage !== 'undefined') {
      const storedData = localStorage.getItem('nse_option_data');
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData) as ApiResponse;
          store.setData(parsedData);
        } catch (error) {
          console.error('Error parsing stored data:', error);
        }
      }
    }

    resolve(store);
  });
}

