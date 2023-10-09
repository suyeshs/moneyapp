import { makeObservable, observable, action, reaction, runInAction, autorun } from 'mobx';
import axios from 'axios';
import { NseOptionData, NseApiResponse} from '../types';
import { ExpiryDateStore } from './ExpiryDateStore';
import { DefaultStore } from './DefaultStore';

export class NseFetchStore {
  data = observable.array<NseOptionData>([]);
  atmStrike: number | null = null;
  atmStrikeIndex: number | null = null;
  expiryDate: string | null = null;
  expiryDates: string[] = [];
  isLoading: boolean = false;
  underlyingValue: number | null = null;
  intervalId: number | null = null;
  symbol: string = 'NIFTY';
  expiryDateStore: ExpiryDateStore;
  defaultStore: DefaultStore;
  lot_size: number | null = null; // Added a new observable property for lot size
  fairPrice: number | null = null;



  setSymbol = async (symbol: string): Promise<string> => {
    console.log('setSymbol called with symbol:', symbol);
    this.symbol = symbol || 'NIFTY';
  
    // Fetch expiry dates for the new symbol
    await this.expiryDateStore.fetchExpiryDatesForSymbol(symbol);
  
    runInAction(() => {
      // Set expiryDate to the first available expiry date
      this.expiryDate = this.expiryDateStore.expiryDates[0] || null;
    });
  
    // Set expiryDate in defaultStore to the first available expiry date
    if (this.expiryDate) {
      runInAction(() => {
        this.defaultStore.setExpiryDate(this.expiryDate!);
      });
    } else {
      console.warn('expiryDate is null, not calling setExpiryDate');
    }
    console.log('expiryDate after fetchExpiryDatesForSymbol:', this.expiryDate);   
  
    // Return the expiryDate
    return this.expiryDate || '';
  };
  

  constructor(defaultStore: DefaultStore,expiryDateStore: ExpiryDateStore,initialNseData?: NseOptionData[]) {
    console.log('NseFetchStore constructor called');
    this.defaultStore = defaultStore;
    this.expiryDateStore = expiryDateStore;
    makeObservable(this, {
      atmStrike: observable,
      atmStrikeIndex: observable,
      symbol: observable,
      expiryDate: observable,
      expiryDates: observable,
      isLoading: observable,
      setIsLoading: action,
      setData: action,
      setAtmStrikeIndex: action,
      calculateAtmStrike: action,
      setExpiryDate: action,
      setExpiryDates: action,
      setSymbol: action,
      fetchPutCallRatioData: action,
      lot_size: observable // Added this line
    });
  
    // Use autorun instead of reaction
    autorun(() => {
      if (this.expiryDate) {
        this.fetchData();
      }
    });
  
    // Call setSymbol function and wait for it to complete
    this.setSymbol(this.symbol).then(() => {
      if (initialNseData) {
        this.data.replace(initialNseData);
         // Set lot_size when initializing the store with data if available
         this.lot_size = initialNseData[0]?.lot_size || null;
      }
  
      if (typeof window !== 'undefined') {
        this.intervalId = window.setInterval(() => {
          // Use the current symbol and expiry date in the fetchData call
          if (this.expiryDate) {
            this.fetchData();
          }
        }, 18000);
      }
    });
  }
  setIsLoading(loading: boolean) {
    this.isLoading = loading;
  }

  setData(data: NseOptionData[]) {
    
    this.data.splice(0, this.data.length, ...data);this.data.replace(data);
    if (data.length > 0) {
      console.log('Setting underlyingValue to:', data[0].CE_underlyingValue || data[0].PE_underlyingValue);
      this.underlyingValue = data[0].CE_underlyingValue || data[0].PE_underlyingValue;
      // Extract and set lot_size from the fetched data
      this.lot_size = data[0].lot_size || null;
    } else {
      this.underlyingValue = null;
    }
    this.calculateAtmStrike();
  }

  calculateAtmStrike() {
    if (!this.underlyingValue || this.data.length === 0) {
      this.atmStrike = null;
      this.atmStrikeIndex = null;
      return;
    }

    let closestDiff = Number.MAX_VALUE;
    let closestIndex = -1;
    this.data.forEach((option, index) => {
      const diff = Math.abs(this.underlyingValue! - option.strikePrice);
      if (diff < closestDiff) {
        closestDiff = diff;
        closestIndex = index;
      }
    });

    this.atmStrike = this.data[closestIndex]?.strikePrice || null;
    this.atmStrikeIndex = closestIndex !== -1 ? closestIndex : null;
  }

  setAtmStrikeIndex(index: number | null): void {
    this.atmStrikeIndex = index;
  }

  getDataAtIndex(index: number): NseOptionData | null {
    if (this.data && this.data.length > index) {
      return this.data[index];
    } else {
      return null;
    }
  }

  setExpiryDate(expiryDate: string): void {
    this.expiryDate = expiryDate;
  }

  setExpiryDates(dates: string[]): void {
    this.expiryDates = dates;
  }
  

  fetchData = async (userSelectedStock: string = this.symbol || 'NIFTY', firstExpiryDate: string | null = this.expiryDate) => {
    if (!firstExpiryDate) {
      console.log('Expiry date is not set, cannot fetch data');
      throw new Error('Expiry date is not set, cannot fetch data');
    }
    this.isLoading = true;

    try {
      const response = await axios.get(`https://tradepodapisrv.azurewebsites.net/api/paytm/?symbol=${encodeURIComponent(this.symbol)}&expiry_date=${encodeURIComponent(firstExpiryDate)}`);
      console.log("API Response: ", response.data);  // Add this line to log the API response
      const data = response.data as NseApiResponse;

      if (data && data.nse_options_data) {
        
        this.setData(data.nse_options_data);
        console.log('underlyingValue after setData:', this.underlyingValue);
        return data.nse_options_data; // Return the fetched data
      } else {
        throw new Error('Data or data.nse_option_data is undefined');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      return []; // Return an empty array in case of an error
    } finally {
      this.isLoading = false;
    }
  };

  dispose() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
    }
  }



  fetchPutCallRatioData = async (symbol: string, expiryDate: string) => {
    // Fetch the data for the given symbol and expiry date
    const data = await this.fetchData(symbol, expiryDate);

    // Calculate the Put/Call ratio for each strike price
    const putCallRatioData = data.map(option => {
      if (option.CE_totalTradedVolume && option.PE_totalTradedVolume) {
        return {
          strikePrice: option.strikePrice,
          putCallRatio: option.PE_totalTradedVolume / option.CE_totalTradedVolume
        };
      } else {
        return null;
      }
    }).filter(item => item !== null);

    // Format the data for the chart
    const formattedData = putCallRatioData.map(item => {
      if (item) {
        const time = new Date(item.strikePrice).getTime() / 1000; // Convert the strike price to a UNIX timestamp
    
        return {
          time,
          value: item.putCallRatio
        };
      }
      return null;
    }).filter(item => item !== null);

    return formattedData;
  };

}

export const initializeNseFetchStore = (defaultStore: DefaultStore, expiryDateStore: ExpiryDateStore, initialNseData?: NseOptionData[]): NseFetchStore => {
  return new NseFetchStore(defaultStore, expiryDateStore, initialNseData);
};