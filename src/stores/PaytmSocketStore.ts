import { makeAutoObservable, observable, action, computed, autorun } from "mobx";
import { OptionData } from "../types";
import { useWebSocketMobX } from "../hooks/useSocketMobx";


export class PaytmSocketStore {
  @observable data: OptionData[] = [];
  @observable isInitialLoadCompleted: boolean = false;
  @observable underlyingValue: number | null = null;
  @observable selectedExpiry: string = "";
  @observable selectedSymbol: string = "";
  @observable lastStrike: number | null = null;
  @observable expiryDates: string[] = [];
  @observable previousDay: number | null = null;
  @observable comparison: "up" | "down" | null = null; // Type-safe comparison
 



  constructor() { 
    makeAutoObservable(this);
  // Use autorun to react to changes in selectedSymbol and selectedExpiry
   
    
  }

  @computed get tableRows() {
    return this.data.map(row => ({
      ...row,
      key: row.strikePrice // Add a unique key for React to track row updates
    }));
  }

   // Method to return an array of symbols
   get symbols() {
    return Array.from(new Set(this.data.map(item => item.symbol)));
  }

  setUnderlyingValue(value: number) {
    this.underlyingValue = value;
  }
  setLastStrike(lastStrike: number) {
    this.lastStrike = lastStrike;
  }

  setpreviousDay(previousDay: number) {
    this.previousDay = previousDay;

  }

  setComparison(change: "up" | "down" | null) {
    this.comparison = change;
    console.log("setting comparison in set comparison:", change);
  }
  


  setDefaultSymbol(symbol: string) {
    this.selectedSymbol = symbol;
  }

  setSelectedExpiry(expiry: string) {
    this.selectedExpiry = expiry;
    expiry  }

  setExpiryDates(dates: string[]) {
    this.expiryDates = dates;
  }

  setSelectedSymbol(symbol: string) {
    symbol  }



  

 

  @action
  setData(newData: OptionData[]) {
    this.data = newData;
    if (newData.length > 0) {
      this.underlyingValue = newData[0].underlyingValue;
      console.log("setting data in set data:", newData);

      if (!this.isInitialLoadCompleted && newData.some(item => item.strikePrice === 24250)) {
        this.isInitialLoadCompleted = true;
      }
    }
  }

  @action
  updateData(update: OptionData) {
    const index = this.data.findIndex((item) => item.strikePrice=== update.strikePrice);
    if (index !== -1 && this.isInitialLoadCompleted === true) {
      console.log("Updating data with:", update);
      this.data[index] = { ...this.data[index], ...update }; // Ensure immutability
      this.underlyingValue = update.underlyingValue;
    }
  }

  @action
  updateValues() {
    if (this.previousDay !== null && this.underlyingValue !== null) {
      if (this.underlyingValue > this.previousDay) {
        this.setComparison("up");
      } else if (this.underlyingValue < this.previousDay) {
        this.setComparison("down");
      } else {
        this.setComparison(null);
      }
    }
    // Assuming you still want to update underlyingValue with newValue
    
  }


  @action
  setInitialLoadCompleted(value: boolean) {
    this.isInitialLoadCompleted = value;
  }

  
}

export const paytmSocketStore = new PaytmSocketStore();
