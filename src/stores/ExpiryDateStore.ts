import { makeObservable, observable, action } from 'mobx';
import axios from 'axios';
import expiryDates from '../nifty-expiry-dates.json';

// Caching utility, mimicking SWR's caching mechanism
const cache = new Map();

const fetcher = async (url: string) => {
  const { data } = await axios.get(url);
  return data;
};

export class ExpiryDateStore {
  expiryDates: string[] = [];
  isLoading: boolean = false;

  constructor() {
    makeObservable(this, {
      expiryDates: observable,
      isLoading: observable,
      setExpiryDates: action,
      fetchExpiryDatesForSymbol: action,
    });
  }

  setExpiryDates(dates: string[]): void {
    this.expiryDates = dates;
  }

  fetchExpiryDatesForSymbol = async (symbol: string = "NIFTY") => {
    this.isLoading = true;
      
    const url = `https://tradepodapisrv.azurewebsites.net/api/get-expiry/?symbol=${encodeURIComponent(symbol)}`;
    console.log(`Generated URL for Symbol ${symbol}:`, url);
  
    if (cache.has(url)) {
      this.setExpiryDates(cache.get(url));
      this.isLoading = false;
      return;
    }
  
    try {
      const data = await fetcher(url);
      
      if (data?.expiry_dates?.length) {
        this.setExpiryDates(data.expiry_dates);
        cache.set(url, data.expiry_dates); // Cache the data
        console.log(`Expiry Dates Stored for Symbol ${symbol}:`, this.expiryDates);
      } else {
        console.error(`Expiry dates not found for symbol: ${symbol}`);
        this.setExpiryDates([]); // Clear the expiry dates
      }
    } catch (error) {
      console.error(`Error fetching expiry dates for symbol: ${symbol}`, error);
      
        // Then, when you need to use it, access the `expiryDates` property:
        this.setExpiryDates(expiryDates.expiryDates);
    } finally {
      this.isLoading = false;
    }
  };
}

export const initializeExpiryDateStore = (): ExpiryDateStore => {
  return new ExpiryDateStore();
};
