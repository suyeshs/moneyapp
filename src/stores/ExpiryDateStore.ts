import { makeObservable, observable, action, makeAutoObservable } from 'mobx';

export class ExpiryDateStore {
  expiryDates: string[] = [];
  isLoading: boolean = false;
  isFetching: boolean = false;
  defaultExpiryDate: string = ''; // Default expiry date variable

  constructor() {
    makeAutoObservable(this, {
      expiryDates: observable,
      isLoading: observable,
      isFetching: observable,
      defaultExpiryDate: observable, // Make defaultExpiryDate observable
      setExpiryDates: action,
      updateExpiryDates: action,
      fetchExpiryDatesForSymbol: action,
      setDefaultExpiryDate: action, // Action to set defaultExpiryDate
    });
  }

  @action
  setExpiryDates(dates: string[]): void {
    this.expiryDates = dates;
    if (dates.length > 0) {
      // Set defaultExpiryDate to the first date in the array
      this.setDefaultExpiryDate(dates[0]);
      console.log('Default expiry date set to:', dates);
    }
  }

  @action
  setDefaultExpiryDate(date: string): void {
    this.defaultExpiryDate = date;
  }

  // Export a function that calls setExpiryDates internally
  public updateExpiryDates(dates: string[]): void {
    this.setExpiryDates(dates);
  }

  fetchExpiryDatesForSymbol = async (symbol: string) => {
    if (this.isFetching) return;
    this.isFetching = true;
    this.isLoading = true;

    try {
      //const response = await fetch(`https://tradepoddjango-vzpocpxkaa-uc.a.run.app/api/get-expiry?symbol=${symbol}`);
      const response = await fetch(`http://127.0.0.1:8000/api/get-expiry?symbol=${symbol}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const expiryDates = data.expiry_dates;
      this.setExpiryDates(expiryDates);
    } catch (error) {
      console.error(`Error fetching expiry dates for symbol: ${symbol}`, error);
    } finally {
      this.isLoading = false;
      this.isFetching = false;
    }
  };
}

export const initializeExpiryDateStore = (): ExpiryDateStore => {
  return new ExpiryDateStore();
};
