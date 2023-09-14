// InstrumentsStore.js

import { makeAutoObservable } from 'mobx';
import instrumentsData from '../../src/data/instruments.json';

class InstrumentsStore {
  instruments = [] as string[]; // Initialize instruments as an empty array

  constructor() {
    makeAutoObservable(this);

    this.buildInstruments();
  }

  buildInstruments() {
    this.instruments = instrumentsData.map((instrument: any) => instrument.ShortName);
  }
}
//console.log(instrumentsData);

const instrumentsStore = new InstrumentsStore();
export default instrumentsStore;
