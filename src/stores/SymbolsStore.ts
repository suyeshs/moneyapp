import { makeObservable, observable, action } from 'mobx';
import axios from 'axios';

export class SymbolStore {
  symbols: string[] = [];  // Initialized as an array
  isLoading: boolean = false;

  constructor() {
    makeObservable(this, {
      symbols: observable,
      isLoading: observable,
      setSymbols: action,
      fetchSymbols: action,
    });
  }

  setSymbols(symbols: string[]): void {
    this.symbols = symbols.map(symbol => symbol.toUpperCase());
  }

  fetchSymbols = async () => {
    this.isLoading = true;
  
    try {
      // Fetch symbols
      const symbolResponse = await axios.get(`https://tradepodapisrv.azurewebsites.net/api/symbols`);
      const symbolData = symbolResponse.data;
      if (Array.isArray(symbolData)) {
        this.setSymbols(symbolData);
        console.log(this.symbols);  // Log the symbols
      } else {
        throw new Error('Symbols not found');
      }
    } catch (error) {
      console.error('Error fetching symbols:', error);
    } finally {
      this.isLoading = false;
    }
  };
}  // This is the missing closing brace

export const initializeSymbolStore = (): { symbolStore: SymbolStore } => {
  return { symbolStore: new SymbolStore() };
};