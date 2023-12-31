import { makeObservable, observable, action, reaction } from 'mobx';
import useSWR from 'swr';
import axios from 'axios';
import { BreezeOptionData, BreezeApiResponse} from '../types';
import { ExpiryDateStore } from './ExpiryDateStore';
import { DefaultStore } from './DefaultStore';





export class BreezeFetchStore {
  data = observable.array<BreezeOptionData>([]);
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
  

  constructor(defaultStore: DefaultStore,expiryDateStore: ExpiryDateStore,initialNseData?: BreezeOptionData[]) {
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
    });

     // Set up a reaction that observes symbol and expiryDate from DefaultStore
    reaction(
      () => [defaultStore.symbol, defaultStore.expiryDate],
      () => {
        this.fetchData(defaultStore.symbol, defaultStore.expiryDate || '');
      }
    );

    if (initialNseData) {
      this.data.replace(initialNseData);
    }

    if (typeof window !== 'undefined') {
      this.intervalId = window.setInterval(() => {
        const expiryDate = this.expiryDate || this.defaultStore.expiryDate || '';
        this.fetchData(this.symbol || 'NIFTY', expiryDate);
      }, 18000);
    }
  }

  setIsLoading(loading: boolean) {
    this.isLoading = loading;
  }

  


  setData(data: BreezeOptionData[]) {
    console.log('setData called with data:', data);
    this.data.splice(0, this.data.length, ...data);
    this.data.replace(data);
    
    // Replace the following block with the new code snippet
    if (data.length > 0 && data[0] && (data[0].CE_underlyingValue !== undefined || data[0].PE_underlyingValue !== undefined)) {
      const underlyingValue = parseFloat((data[0].CE_underlyingValue || data[0].PE_underlyingValue).toString());
      console.log('Setting underlyingValue to:', underlyingValue);
      this.underlyingValue = isNaN(underlyingValue) ? null : underlyingValue;
    } else {
      this.underlyingValue = null;
    }
    
    this.calculateAtmStrike();
  }

  setSymbol = async (symbol: string) => {
    this.symbol = symbol || 'NIFTY';

    // Fetch expiry dates for the new symbol
    await this.expiryDateStore.fetchExpiryDatesForSymbol(symbol);

    // Set expiryDate to the first available expiry date
    this.expiryDate = this.expiryDateStore.expiryDates[0] || null;

     // Set expiryDate in defaultStore to the first available expiry date
     if (this.expiryDate) {
      this.defaultStore.setExpiryDate(this.expiryDate);
    } else {
      console.warn('expiryDate is null, not calling setExpiryDate');
    }
    console.log('expiryDate after fetchExpiryDatesForSymbol:', this.expiryDate);   
    // Fetch new data based on the updated symbol and expiryDate
    this.fetchData(this.symbol, this.expiryDate || '');
  };

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

  getDataAtIndex(index: number): BreezeOptionData | null {
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
  fetchData = async (userSelectedStock: string = this.symbol || 'NIFTY', firstExpiryDate: string = this.expiryDate || '28-Sep-2023') => {
    this.isLoading = true;
  
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/option-chain-breeze/?symbol=NIFTY&expiry_date=`);
      const data = response.data as BreezeApiResponse;
  
      if (data && data.nse_options_data) {
        console.log('Fetched data:', data.nse_options_data);
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


  }

export const initializeBreezeFetchStore = (defaultStore: DefaultStore, expiryDateStore: ExpiryDateStore, initialNseData?: BreezeOptionData[]): BreezeFetchStore => {
  return new BreezeFetchStore(defaultStore, expiryDateStore, initialNseData);
};