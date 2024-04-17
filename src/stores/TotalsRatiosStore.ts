// PCRPStore.ts
import { observable, action, makeObservable } from "mobx";

class PCRPStore {
  pcrp: string | number = 0;
  pcr: string | number = 0;

  constructor() {
    makeObservable(this, {
      pcrp: observable,
      pcr: observable,
      setPCRP: action,
      setPCR: action,
    });
  }

  setPCRP(pcrp: string | number) {
    this.pcrp = pcrp;
    
  }

  setPCR(pcr: string | number) {
    this.pcr = pcr;
    
  }
}

const pcrpStore = new PCRPStore();
export default pcrpStore;
