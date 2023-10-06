// ExpiryDateStore.ts
import { makeObservable, observable, action } from 'mobx';

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
      
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/get-expiry?symbol=${symbol}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const expiryDates = data.expiry_dates; // Extract expiry_dates from response
      console.log(`Fetched expiry dates for symbol: ${symbol}`, expiryDates); // Debugging check
      this.setExpiryDates(expiryDates);
    } catch (error) {
      console.error(`Error fetching expiry dates for symbol: ${symbol}`, error);
    } finally {
      this.isLoading = false;
    }
  };
}

export const initializeExpiryDateStore = (): ExpiryDateStore => {
  return new ExpiryDateStore();
};