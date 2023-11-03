import { makeObservable, observable, action } from 'mobx';

export class ExpiryDateStore {
  expiryDates: string[] = [];
  isLoading: boolean = false;
  isFetching: boolean = false; // New flag to track ongoing fetch requests

  constructor() {
    makeObservable(this, {
      expiryDates: observable,
      isLoading: observable,
      isFetching: observable, // Make isFetching observable
      setExpiryDates: action,
      fetchExpiryDatesForSymbol: action,
    });
  }

  setExpiryDates(dates: string[]): void {
    this.expiryDates = dates;
  }

  fetchExpiryDatesForSymbol = async (symbol: string = "NIFTY") => {
    if (this.isFetching) return; // If a request is already in progress, return immediately

    this.isFetching = true; // Set the flag to true when a request starts
    this.isLoading = true;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/get-expiry?symbol=${symbol}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      const expiryDates = data.expiry_dates; // Extract expiry_dates from response
      this.setExpiryDates(expiryDates);
    } catch (error) {
      console.error(`Error fetching expiry dates for symbol: ${symbol}`, error);
    } finally {
      this.isLoading = false;
      this.isFetching = false; // Reset the flag when the request is done
    }
  };
}

export const initializeExpiryDateStore = (): ExpiryDateStore => {
  return new ExpiryDateStore();
};
