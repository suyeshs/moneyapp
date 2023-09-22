import { makeObservable, observable, action } from 'mobx';

export class DefaultStore {
  symbol: string = 'NIFTY';
  expiryDate: string | null = null;

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

  setExpiryDate(expiryDate: string) {
    console.log('setExpiryDate called with expiryDate:', expiryDate);
    this.expiryDate = expiryDate;
  }
}

export const initializeDefaultStore = (): DefaultStore => {
  return new DefaultStore();
};