import { makeObservable, observable, action } from 'mobx';
import { NseOptionData } from '../types';

export class NseDataStore {
  data = observable.array<NseOptionData>([]);

  constructor() {
    makeObservable(this, {
      data: observable,
      setData: action,
    });
  }

  setData(data: NseOptionData[]) {
    this.data.replace(data);
  }
}

export const initializeNseDataStore = (): NseDataStore => {
  return new NseDataStore();
};