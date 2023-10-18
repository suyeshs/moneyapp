import {
  makeObservable,
  observable,
  action,
  autorun,
  computed,
  runInAction,
} from "mobx";
import axios from "axios";
import { NseOptionData, NseApiResponse } from "../types";
import { ExpiryDateStore } from "./ExpiryDateStore";
import { DefaultStore } from "./DefaultStore";

export class NseFetchStore {
  data = observable.array<NseOptionData>([]);
  atmStrike: number | null = null;
  atmStrikeIndex: number | null = null;
  expiryDate: string | null = null;
  expiryDates: string[] = [];
  isLoading: boolean = false;
  underlyingValue: number | null = null;
  intervalId: number | null = null;
  symbol: string = "NIFTY";
  expiryDateStore: ExpiryDateStore;
  defaultStore: DefaultStore;
  lot_size: number | null = null; // Added a new observable property for lot size
  fairPrice: number | null = null;
  ceLastPriceForATM: number | null = null;
  peLastPriceForATM: number | null = null;
  pcr: number | null = null; // Added a new observable property for PCR

  constructor(
    defaultStore: DefaultStore,
    expiryDateStore: ExpiryDateStore,
    initialNseData?: NseOptionData[]
  ) {
    this.defaultStore = defaultStore;
    this.expiryDateStore = expiryDateStore;

    makeObservable(this, {
      atmStrike: observable,
      atmStrikeIndex: observable,
      symbol: observable,
      expiryDate: observable,
      expiryDates: observable,
      isLoading: observable,
      setIsLoading: action,
      setData: action,
      setAtmStrikeIndex: action,
      calculateAtmStrike: action,
      setExpiryDate: action,
      setExpiryDates: action,
      lot_size: observable, // Added this line
      setSymbol: action, // Explicitly specify setSymbol as an action
     
     
    });

    // Use autorun to fetch data when expiryDate changes
    autorun(() => {
      if (this.expiryDate) {
        this.fetchData();
      }
    });

    // Initialize with default symbol and fetch data
    this.setSymbol(this.symbol);

    // Set up an interval for periodic data fetch
    if (typeof window !== "undefined") {
      this.intervalId = window.setInterval(() => {
        this.checkAndFetchData();
      }, 18000);
    }
  }

  setIsLoading(loading: boolean) {
    this.isLoading = loading;
  }

  setData(data: NseOptionData[]) {
    this.data.replace(data);

    if (data.length > 0) {
      
      this.underlyingValue =
        data[0].CE_underlyingValue || data[0].PE_underlyingValue;
      // Extract and set lot_size from the fetched data
      this.lot_size = data[0].lot_size || null;
    }

    this.calculateAtmStrike();
   
  }

  

  calculateAtmStrike() {
    if (!this.underlyingValue || this.data.length === 0) {
      this.atmStrike = null;
      this.atmStrikeIndex = null;
      return;
    }

    let closestDiff = Number.MAX_VALUE;
    let closestIndex = -1;

    this.data.forEach((option, index) => {
      const diff = Math.abs(this.underlyingValue! - option.strikePrice);
      if (diff < closestDiff) {
        closestDiff = diff;
        closestIndex = index;
      }
    });

    this.atmStrike = this.data[closestIndex]?.strikePrice || null;
    this.atmStrikeIndex = closestIndex !== -1 ? closestIndex : null;
  }

  setAtmStrikeIndex(index: number | null): void {
    this.atmStrikeIndex = index;
  }

  getDataAtIndex(index: number): NseOptionData | null {
    if (this.data && this.data.length > index) {
      return this.data[index];
    } else {
      return null;
    }
  }

  setExpiryDate(expiryDate: string): void {
    this.expiryDate = expiryDate;
    // Clear or update other observables/state variables
    this.data.clear();
    this.checkAndFetchData();
  }

  setExpiryDates(dates: string[]): void {
    this.expiryDates = dates;
  }

  setSymbol(symbol: string): void {
    //console.log("setSymbol called with symbol:", symbol);
    this.symbol = symbol || "NIFTY";

    // Fetch expiry dates for the new symbol and wait for it to complete
    this.expiryDateStore.fetchExpiryDatesForSymbol(symbol);

    if (this.expiryDateStore.expiryDates.length > 0) {
      runInAction(() => {
        // Set expiryDate to the first available expiry date
        this.expiryDate = this.expiryDateStore.expiryDates[0];
        this.defaultStore.setExpiryDate(this.expiryDate);
      });

     // console.log(
        //"expiryDate after fetchExpiryDatesForSymbol:",
       // this.expiryDate
      //);

      // Since expiry date is now set, fetch data if it hasn't been fetched before
      if (!this.data.length) {
        this.fetchData();
      }
    } else {
      console.warn("No expiry dates available for the selected symbol");
    }
  }

  checkAndFetchData() {
    if (this.expiryDate) {
      this.fetchData();
    }
  }

  async fetchData(
    userSelectedStock: string = this.symbol || "NIFTY",
    firstExpiryDate: string | null = this.expiryDate
  ) {
    if (!firstExpiryDate) {
      //console.log("Expiry date is not set, cannot fetch data");
      throw new Error("Expiry date is not set, cannot fetch data");
    }
    this.isLoading = true;

    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/paytm/?symbol=${encodeURIComponent(
          this.symbol
        )}&expiry_date=${encodeURIComponent(firstExpiryDate)}`
      );
      //console.log("API Response: ", response.data);
      const data = response.data as NseApiResponse;

      if (data && data.nse_options_data) {
        this.setData(data.nse_options_data);
        //console.log("underlyingValue after setData:", this.underlyingValue);
        return data.nse_options_data;
      } else {
        throw new Error("Data or data.nse_option_data is undefined");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    } finally {
      this.isLoading = false;
    }
  }

  dispose() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
    }
  }
}

export const initializeNseFetchStore = (
  defaultStore: DefaultStore,
  expiryDateStore: ExpiryDateStore,
  initialNseData?: NseOptionData[]
): NseFetchStore => {
  return new NseFetchStore(defaultStore, expiryDateStore, initialNseData);
};
