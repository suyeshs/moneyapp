import { makeAutoObservable } from 'mobx';

export class SymbolStore {
  selectedSymbol: string = 'NIFTY';

  constructor() {
    makeAutoObservable(this);
  }

  setSelectedSymbol(symbol: string) {
    this.selectedSymbol = symbol;
  }
}

export const symbolStore = new SymbolStore();
