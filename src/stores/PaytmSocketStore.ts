import { makeAutoObservable, makeObservable } from "mobx";
import { OptionData } from "../types";


export class PaytmSocketStore {
  data: OptionData[] = [];
  isLoading: boolean = true;
  isInitialLoadCompleted: boolean = false; // New property to track initial load completion
  underlyingValue: number | null = null; // Add this to store the underlying value
  
  

  constructor() {
    makeAutoObservable(this);
  }

  

  setData(newData: OptionData[]) {
    this.data = newData;
    if (newData.length > 0) {
      this.underlyingValue = newData[0].underlyingValue; // Set the initial underlying value
    }
  }

  updateData(update: OptionData) {
    const index = this.data.findIndex(item => item.strikePrice === update.strikePrice);
    if (index !== -1) {
      // Update properties individually
      Object.assign(this.data[index], update);
      this.underlyingValue = update.underlyingValue; // Update the underlying value

    }
  }

  
 
  

  setInitialLoadCompleted(value: boolean) {
    this.isInitialLoadCompleted = value;
    console.log(this.isInitialLoadCompleted)
  }
}

export const paytmSocketStore = new PaytmSocketStore();
