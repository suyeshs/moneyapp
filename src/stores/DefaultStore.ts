// DefaultStore.ts
import { makeObservable, observable, action, runInAction } from 'mobx';
import { initializeExpiryDateStore, ExpiryDateStore } from './ExpiryDateStore';

export class DefaultStore {
  symbol: string = 'NIFTY';
  expiryDate: string | null = null;
  expiryDateStore: ExpiryDateStore = initializeExpiryDateStore();

  constructor() {
    makeObservable(this, {
      symbol: observable,
      expiryDate: observable,
      setSymbol: action,
      setExpiryDate: action,
    });

    // Set the expiryDate to the first expiry date for the initial symbol
    this.setSymbol(this.symbol);
  }

  setSymbol = async (symbol: string) => {
    this.symbol = symbol;

    // Fetch expiry dates for the new symbol
    await this.expiryDateStore.fetchExpiryDatesForSymbol(symbol);

    // Set expiryDate to the first available expiry date
    runInAction(() => {
      this.expiryDate = this.expiryDateStore.expiryDates[0] || null;
    });
  }

  setExpiryDate(expiryDate: string) {
    this.expiryDate = expiryDate;
  }
}


