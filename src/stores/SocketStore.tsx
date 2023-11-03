import { makeAutoObservable } from "mobx";
import { CombinedStockData } from "../types";

class SocketStore {
  socketData: CombinedStockData[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  setCombinedStockData(data: CombinedStockData[]) {
    this.socketData = data;
  }
}

const socketStore = new SocketStore();
export default socketStore;
