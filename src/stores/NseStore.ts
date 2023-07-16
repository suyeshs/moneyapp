import { makeObservable, observable, action } from 'mobx';
import { ApiResponse, OptionData } from '@/types';

// NseStore class to manage and interact with options data
export class NseStore {
  data: OptionData[] | null = null; // data for options
  lastRefresh: string = ''; // time of the last data refresh
  maxCE_OIIndex: number = 0; // index of the max CE OI
  isLoading: boolean = false; // boolean flag for data loading state
  closestStrikePrice: number = 0; // closest strike price to the underlying value
  closestStrikePriceIndex: number = 0; // index of the closest strike price
  atmStrike: number | null = null; // At the money strike price
  atmStrikeIndex: number | null = null; // index of the At the money strike price

  // constructor to initialize data and setup observables and actions
  constructor(initialData?: OptionData[]) {
    makeObservable(this, {
      data: observable,
      lastRefresh: observable,
     
      isLoading: observable,
      closestStrikePrice: observable,
      closestStrikePriceIndex: observable,
      atmStrike: observable,
      atmStrikeIndex: observable,
      setData: action,
     
      
      setAtmStrikeIndex: action,
      calculateAtmStrike: action
    });

    // if initial data is available, set the data
    if (initialData) {
      this.setData(initialData);
    }
  }

  // setData action to set the data and update localStorage
  setData(data: OptionData[]): void {
    //console.log('setData:', data);
    if (this.data !== data) {
      this.data = data;
      //console.log('data', this.data);
      // store the data in localStorage if available
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem('nse_option_data', JSON.stringify(this.data));
          //----console.log('nse_option_data set in localStorage:', this.data);
        } catch (error) {
          //----console.error('Error setting data in localStorage:', error);
        }
      }
    }
    // calculate the index of the closest strike price and At the money strike
    //this.calculateClosestStrikePriceIndex();
    this.calculateAtmStrike();
  }





  // calculateAtmStrike action to calculate the At the money strike price and index
  calculateAtmStrike(): void {
    // calculate only if data is available
    if (this.data && this.data.length > 0) {
      let niftyValue = this.data[0]?.PE_underlyingValue || 0;
      this.atmStrike = this.roundHalfUp(niftyValue, 50);
      console.log('calculateAtmStrike:', this.atmStrike);

      // find the index of the atm strike price
      const index = this.data.findIndex(item => item.strikePrice === this.atmStrike);
      // set the index
      this.setAtmStrikeIndex(index);
      console.log('atmStrikeIndex:', this.atmStrikeIndex);
    }
  }

  // setAtmStrikeIndex action to set the At the money strike price index
  setAtmStrikeIndex(index: number | null): void {
    this.atmStrikeIndex = index;
  }

    // getDataAtIndex action to get the data at a specific index
    getDataAtIndex(index: number): OptionData | null {
      // return data if index is valid, else return null
      if(this.data && this.data.length > index) {
        return this.data[index];
      } else {
        console.log(`No data available at index ${index}`);
        return null;
      }
    }

  // helper method to round a value to the nearest half up
  private roundHalfUp(niftyValue: number, base: number): number {
    return Math.sign(niftyValue) * Math.round(Math.abs(niftyValue) / base) * base;
  }
}

// store instance to maintain state across app
let store: NseStore | null = null;

// initializeStore function to create the store instance with initial data
export function initializeStore(initialData?: OptionData[]): NseStore {
  if (store === null || typeof window === 'undefined') {
    store = new NseStore(initialData);
  }

  // set the initial data if available
  if (initialData && store !== null) {
    store.setData(initialData);
  }

  // check if stored data is available and set it in the store
  if (typeof localStorage !== 'undefined') {
    const storedData = localStorage.getItem('nse_option_data');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData) as OptionData[];
        store.setData(parsedData);
      } catch (error) {
        console.error('Error parsing stored data:', error);
      }
    }
  }

  return store;
}
