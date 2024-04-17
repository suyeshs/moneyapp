import { makeAutoObservable, observable } from "mobx";
import { OptionData } from "../types";

export class PaytmStoreAll {
  @observable data: OptionData[] = [];
  @observable isLoading: boolean = false;
  @observable isInitialLoadCompleted: boolean = true;
  @observable underlyingValue: number | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setData(newData: OptionData[]) {
    this.data = newData;
    if (newData.length > 0) {
      this.underlyingValue = newData[0].underlyingValue;
    }
    
  }

  updateData(update: OptionData) {
    const index = this.data.findIndex((item) => item.strikePrice === update.strikePrice);
    if (index !== -1) {
      Object.assign(this.data[index], update);
      this.underlyingValue = update.underlyingValue;
     
    }
  }

  setInitialLoadCompleted(value: boolean) {
    this.isInitialLoadCompleted = true;
    
  }
}

export const paytmStoreAll = new PaytmStoreAll();
