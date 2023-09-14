import { makeObservable, observable, action } from 'mobx';
import axios from 'axios';

export class ExpiryDateStore {
  expiryDates: string[] = [];  // Initialized as an array
  isLoading: boolean = false;

  constructor() {
    makeObservable(this, {
      expiryDates: observable,
      isLoading: observable,
      setExpiryDates: action,
      fetchExpiryDates: action,
      fetchExpiryDatesForSymbol: action, // Add this line
    });
  }

  setExpiryDates(dates: string[]): void {
    this.expiryDates = dates;
  }

  fetchExpiryDates = async () => {
    this.isLoading = true;

    // Fetch expiry dates
    const expiryResponse = await axios.get(`http://127.0.0.1:8000/api/get-expiry/?symbol=NIFTY`);
    const expiryData = expiryResponse.data;
    if (expiryData && expiryData.expiry_dates) {
      this.setExpiryDates(expiryData.expiry_dates);
      console.log(this.expiryDates);  // Log the expiryDates
    } else {
      throw new Error('Expiry dates not found');
    }

    this.isLoading = false;
  };

  fetchExpiryDatesForSymbol = async (symbol: string) => {
    this.isLoading = true;

    // Fetch expiry dates for a specific symbol
    const expiryResponse = await axios.get(`https://127.0.0.1:8000/api/get-expiry/?symbol=${encodeURIComponent(symbol)}`);
    const expiryData = expiryResponse.data;
    if (expiryData && expiryData.expiry_dates) {
      this.setExpiryDates(expiryData.expiry_dates);
      console.log(this.expiryDates);  // Log the expiryDates
    } else {
      throw new Error('Expiry dates not found');
    }

    this.isLoading = false;
  };
}

export const initializeExpiryDateStore = (): ExpiryDateStore => {
  return new ExpiryDateStore();
};