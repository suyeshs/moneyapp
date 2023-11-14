import { makeAutoObservable, autorun } from "mobx";
import { OptionData,OptionDataRow } from "../types";

class PaytmSocketStore {
  data: OptionData[] = [];
  private _dataBuffer: OptionData[] = [];
  private _isBatchUpdating: boolean = false;
  atmStrike: boolean | null = null;
  underlyingValue: number | null = null;
  lot_size: number | null = null;
  atmIndex: number | null = null;
  CE_underlyingValue: number | null = null;
  PE_underlyingValue: number | null = null;
  symbol: string = "";

  constructor() {
    makeAutoObservable(this);
  }

  setData(newData: OptionData[]) {
    this.data = newData;
    console.log("Data being set to the store:", newData);
  }

  beginBatchUpdate() {
    this._isBatchUpdating = true;
    this._dataBuffer = [];
  }

  addToBatch(data: OptionData[]) {
    if (this._isBatchUpdating) {
      this._dataBuffer.push(...data);
    }
  }

  commitBatchUpdate() {
    if (this._isBatchUpdating) {
      this.setData(this._dataBuffer);
      this._isBatchUpdating = false;
    }
  }

  // Method to subscribe to data changes
  subscribe(callback: (data: OptionData[]) => void) {
    return autorun(() => {
      callback(this.data);
    });
  }
}

export const paytmSocketStore = new PaytmSocketStore();
