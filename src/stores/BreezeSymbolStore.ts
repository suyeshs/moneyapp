import { makeObservable, observable, action } from 'mobx';

export class BreezeSymbolStore {
  symbols: string[] = [];  // Initialized as an array
  isLoading: boolean = false;

  constructor() {
    makeObservable(this, {
      symbols: observable,
      isLoading: observable,
      setBreezeSymbols: action,
      loadBreezeSymbols: action,
    });
    this.loadBreezeSymbols();
  }

  setBreezeSymbols(symbols: string[]): void {
    this.symbols = symbols.map(symbol => symbol.toUpperCase());
  }

  loadBreezeSymbols = () => {
    return new Promise((resolve, reject) => {
      try {
        // Load symbols from JSON file
        const symbols = require('./nse-fo-list.json');
        if (Array.isArray(symbols)) {
          this.setBreezeSymbols(symbols);
          console.log(this.symbols);  // Log the symbols
        } else {
          throw new Error('Symbols not found');
        }
      } catch (error) {
        console.error('Error loading symbols:', error);
      }
    });
  };
}

export const initializeBreezeSymbolStore = (): { symbolStore: BreezeSymbolStore } => {
  return { symbolStore: new BreezeSymbolStore() };
};