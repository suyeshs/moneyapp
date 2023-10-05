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
  }

  setSymbol(symbol: string) {
    this.symbol = symbol;
  }

  setExpiryDate = async (expiryDate: string) => {
    console.log('setExpiryDate called with expiryDate:', expiryDate);
    await this.expiryDateStore.fetchExpiryDatesForSymbol(this.symbol);
    runInAction(() => {
      this.expiryDate = expiryDate;
    });
  } // This closing brace was missing
}

export const initializeDefaultStore = (): DefaultStore => {
  return new DefaultStore();
};