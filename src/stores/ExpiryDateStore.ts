// ExpiryDateStore.ts
import { makeObservable, observable, action } from 'mobx';

export class ExpiryDateStore {
  expiryDates: string[] = [];
  isLoading: boolean = false;
  isFetching: boolean = false; // Add this flag

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
    if (this.isFetching) return; // If a request is already in progress, return immediately

    this.isFetching = true; // Set the flag to true when a request starts
    this.isLoading = true;
      
    try {
      
      const response = await fetch(`https://tradepodapisrv.azurewebsites.net/api/get-expiry?symbol=${symbol}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      //console.log('Expiry Store',data);
      
      const expiryDates = data.expiry_dates; // Extract expiry_dates from response
      //console.log(`Fetched expiry dates for symbol: ${symbol}`, expiryDates); // Debugging check
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