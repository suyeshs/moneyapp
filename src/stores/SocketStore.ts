import { makeAutoObservable } from "mobx";
import {OptionData} from "../types";



export class SocketStore {
    data: OptionData[] = [];
    socket: WebSocket | null = null;
    underlyingValue: number; // or whatever the correct type is

  constructor() {
    makeAutoObservable(this);
    this.underlyingValue = 0; // or some other initial value

    this.openSocket();
  }

  openSocket() {
    this.socket = new WebSocket("ws://localhost:8888/tradepod");

    this.socket.onmessage = (event) => {
      const update = JSON.parse(event.data);
      
      // If the update contains an array, it's the initial data
      if (Array.isArray(update)) {
        this.data = update;
      } 
      // If the update contains an object, it's an update to the data
      else if (typeof update === 'object') {
        this.updateData(update);
      }
    };

    this.socket.onerror = (error) => {
      console.log(`WebSocket error: ${error}`);
    };
  }

  updateData(update: OptionData) {
    const index = this.data.findIndex((item) => item.strikePrice === update.strikePrice);
    if (index !== -1) {
      Object.assign(this.data[index], update);
    } else {
      this.data.push(update);
    }
  }

  closeSocket() {
    if (this.socket) {
      this.socket.close();
    }
  }
}

export const socketStore = new SocketStore();