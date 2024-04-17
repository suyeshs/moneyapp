// 1. Create a MobX store
import { makeAutoObservable } from "mobx";
import { OptionData } from "../types";

class OptionsStore {
  gridData: OptionData[] = [];
  isInitialLoadCompleted = false;

  constructor() {
    makeAutoObservable(this);
  }

  setGridData(data: OptionData[]) {
    this.gridData = data;
  }

  setIsInitialLoadCompleted(value: boolean) {
    this.isInitialLoadCompleted = value;
  }
}

const optionsStore = new OptionsStore();
export default optionsStore;