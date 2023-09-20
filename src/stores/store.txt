import { observable, action, makeObservable } from "mobx";
import axios from 'axios';
import { DateTime } from "luxon";
import { OptionData, ApiResponse } from "./types"; // Assuming your types are in 'types.ts'

class NseStore {
  @observable data: OptionData[] = [];
  @observable isLoading: boolean = false;
  @observable error: string | null = null;
  @observable numRows: number | 'all' = 5;

  // Other observables you mentioned
  @observable lastRefresh: Date | null = null;
  @observable maxCE_OIIndex: number | null = null;
  @observable closestStrikePrice: number | null = null;
  @observable closestStrikePriceIndex: number | null = null;
  @observable atmStrike: number | null = null;
  @observable atmStrikeIndex: number | null = null;

  private intervalId?: NodeJS.Timeout;  // Reference to the setInterval

  constructor(initialData: OptionData[] = []) {
    makeObservable(this, {
      data: observable,
      isLoading: observable,
      error: observable,
      numRows: observable,
      fetchOptionData: action.bound,
      startDataFetching: action.bound,
      stopDataFetching: action.bound,
      setNumRows: action.bound,
      // Decorators for other observables and actions you mentioned
      lastRefresh: observable,
      maxCE_OIIndex: observable,
      closestStrikePrice: observable,
      closestStrikePriceIndex: observable,
      atmStrike: observable,
      atmStrikeIndex: observable,
      setData: action.bound,
      setAtmStrikeIndex: action.bound,
      calculateAtmStrike: action.bound
    });

    this.data = initialData || [];

    // Begin data fetching if within the fetching window during store initialization
    if (this.isWithinFetchingWindow()) {
      this.startDataFetching();
    }

    // Check the time every minute to determine if we should start/stop fetching
    setInterval(() => {
      if (this.isWithinFetchingWindow() && !this.intervalId) {
        this.startDataFetching();
      } else if (!this.isWithinFetchingWindow() && this.intervalId) {
        this.stopDataFetching();
      }
    }, 60 * 1000);
  }

  isWithinFetchingWindow(): boolean {
    const ist = DateTime.now().setZone('Asia/Kolkata');
    const startHour = 8;
    const startMinute = 28;
    const endHour = 15;
    const endMinute = 32;

    const startTime = ist.startOf('day').plus({hours: startHour, minutes: startMinute});
    const endTime = ist.startOf('day').plus({hours: endHour, minutes: endMinute});

    return ist >= startTime && ist <= endTime;
  }

  @action.bound
  startDataFetching() {
    this.fetchOptionData();
    this.intervalId = setInterval(() => {
      this.fetchOptionData();
    }, 100000); // 100 seconds
  }

  @action.bound
  stopDataFetching() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  @action.bound
  async fetchOptionData() {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/option-chain-copy?stock_code=NIFTY&expiry_date=13-JUL-2023');
      const data = response.data as ApiResponse;

      if (data && data.nse_option_data) {
        this.setData(data.nse_option_data.map(record => {
          // Add your flattenRecord function logic if needed
          return record; // Example line, adjust as necessary
        }));
      } else {
        throw new Error('Data is missing or undefined');
      }
    } catch (error) {
      this.error = `Error fetching data: ${error.message}`;
      console.error(this.error);
    } finally {
      this.isLoading = false;
    }
  }

  @action.bound
  setNumRows(value: number | 'all'): void {
    this.numRows = value;
  }

  @action.bound
  setData(data: OptionData[]): void {
    this.data = data;
    // Any logic to set other observables related to the data can be added here
    this.calculateAtmStrike();  // For instance, calling this function after setting data
  }

  @action.bound
  calculateAtmStrike() {
    // Implement your logic to calculate ATM strike, and set the atmStrike and atmStrikeIndex observables
  }

  @action.bound
  setAtmStrikeIndex(index: number): void {
    this.atmStrikeIndex = index;
  }

  // ... other methods, getters, setters ...

}

export const initializeStore = (initialData: OptionData[] = []) => {
  return new NseStore(initialData);
};

// If you need other exports or utilities, add them below.
