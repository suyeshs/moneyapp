import { makeAutoObservable } from "mobx";
import { OptionData } from "../types";

export class PaytmSocketStore {
  data: OptionData[] = [];
  isLoading: boolean = true;
  isInitialLoadCompleted: boolean = false; // New property to track initial load completion

  constructor() {
    makeAutoObservable(this);
  }

  

  setData(newData: OptionData[]) {
    this.data = newData;
    console.log("setData", this.data);
    this.isLoading = false;
  }

  updateData(update: OptionData) {
    const index = this.data.findIndex(item => item.strikePrice === update.strikePrice);
    
    if (index !== -1) {
      this.data[index] = { ...this.data[index], ...update };
      //console.log("In Store",this.data);
    }
  }

  setInitialLoadCompleted(value: boolean) {
    this.isInitialLoadCompleted = value;
    console.log(this.isInitialLoadCompleted)
  }
}

export const paytmSocketStore = new PaytmSocketStore();
