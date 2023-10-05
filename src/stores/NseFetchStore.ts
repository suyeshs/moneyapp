import { makeObservable, observable, action, reaction, runInAction } from 'mobx';
import useSWR from 'swr';
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

  setSymbol = async (symbol: string): Promise<string> => {
    this.symbol = symbol || 'NIFTY';

    // Fetch expiry dates for the new symbol
    await this.expiryDateStore.fetchExpiryDatesForSymbol(symbol);

    // Set expiryDate to the first available expiry date
    this.expiryDate = this.expiryDateStore.expiryDates[0] || null;

    // Set expiryDate in defaultStore to the first available expiry date
    if (this.expiryDate) {
      runInAction(() => {
        this.defaultStore.setExpiryDate(this.expiryDate!);
      });
    } else {
      console.warn('expiryDate is null, not calling setExpiryDate');
    }
    console.log('expiryDate after fetchExpiryDatesForSymbol:', this.expiryDate);   

    // Fetch data with the new symbol and expiry date
    this.fetchData();

    // Return the expiryDate
    return this.expiryDate || '';
  };

  constructor(defaultStore: DefaultStore,expiryDateStore: ExpiryDateStore,initialNseData?: NseOptionData[]) {
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
        this.fetchData();
      }
    );

    // Call setSymbol function and wait for it to complete
    this.setSymbol(this.symbol).then((expiryDate) => {
      if (initialNseData) {
        this.data.replace(initialNseData);
      }

      if (typeof window !== 'undefined') {
        this.intervalId = window.setInterval(() => {
          // Use the current symbol and expiry date in the fetchData call
          this.fetchData();
        }, 18000);
      }
    });
  }

  setIsLoading(loading: boolean) {
    this.isLoading = loading;
  }

  setData(data: NseOptionData[]) {
    console.log('setData called with data:', data);
    this.data.splice(0, this.data.length, ...data);this.data.replace(data);
    if (data.length > 0) {
      console.log('Setting underlyingValue to:', data[0].CE_underlyingValue || data[0].PE_underlyingValue);
      this.underlyingValue = data[0].CE_underlyingValue || data[0].PE_underlyingValue;
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
      console.log('Expiry date is not set, calling setSymbol...');
      await this.setSymbol(this.symbol);
      firstExpiryDate = this.expiryDate;
      if (!firstExpiryDate) {
        throw new Error('Expiry date is still not set after calling setSymbol');
      }
    }
    this.isLoading = true;

    try {
      const response = await axios.get(`https://tradepodapisrv.azurewebsites.net/api/option-chain-copy/?symbol=${encodeURIComponent(this.symbol)}&expiry_date=${encodeURIComponent(firstExpiryDate)}`);
      const data = response.data as NseApiResponse;

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

export const initializeNseFetchStore = (defaultStore: DefaultStore, expiryDateStore: ExpiryDateStore, initialNseData?: NseOptionData[]): NseFetchStore => {
  return new NseFetchStore(defaultStore, expiryDateStore, initialNseData);
};