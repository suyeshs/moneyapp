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
      // Set expiry date to a hard-coded value
      this.setExpiryDates([
        
        "05-Oct-2023",
        "12-Oct-2023",
        "19-Oct-2023",
        "26-Oct-2023",
        "02-Nov-2023",
        "30-Nov-2023",
        "28-Dec-2023",
        "28-Mar-2024",
        "27-Jun-2024",
        "26-Dec-2024",
        "26-Jun-2025",
        "24-Dec-2025",
        "25-Jun-2026",
        "31-Dec-2026",
        "24-Jun-2027",
        "30-Dec-2027",
        "29-Jun-2028"
      ]);
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