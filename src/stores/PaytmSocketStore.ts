import { makeAutoObservable, autorun, action } from "mobx";
import { OptionData } from "../types";

class PaytmSocketStore {
  isLoading: boolean = false;
  symbol: string = "";
  data: OptionData[] = [];
  atmStrike: boolean | null = null;
  underlyingValue: number | null = null; // Add the underlyingValue property


  constructor() {
    makeAutoObservable(this);

    // Automatically log the data whenever it changes
    autorun(() => {
      console.log(this.data);
    });
  }

  // Define an action to update the data
  setData = action((newData: OptionData[]) => {
    if (newData && newData.length > 0) {
      console.log("Data being set to the store:", newData);
      
      // Filter out any null or undefined values
      const validData = newData.filter(item => item != null);

      // Round off the values
      const roundedData = validData.map(item => {
        const roundedItem = { ...item };
      
        Object.keys(roundedItem).forEach(key => {
          if (key !== 'gamma' && typeof roundedItem[key as keyof OptionData] === 'number') {
            roundedItem[key as keyof OptionData] = parseFloat((roundedItem[key as keyof OptionData] as number).toFixed(2));
          } else if (key === 'gamma' && typeof roundedItem[key as keyof OptionData] === 'number') {
            roundedItem[key as keyof OptionData] = parseFloat((roundedItem[key as keyof OptionData] as number).toFixed(4));
          }
        });
      
        return roundedItem;
      });
      
      this.data = roundedData;

      this.isLoading = false;
      this.calculateATMStrike(); // Calculate ATM strike after data update
    } else {
      this.isLoading = true;
    }
  });

  // Define an action to update the loading state
  setLoading = action((isLoading: boolean) => {
    this.isLoading = isLoading;
  });

  // Calculate ATM strike rate based on the provided function
   // Calculate ATM strike rate based on the provided function
   calculateATMStrike() {
    if (this.underlyingValue === null || this.data.length === 0) {
      this.atmStrike = null;
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

    this.atmStrike = closestIndex !== -1; // Use a boolean flag to identify ATM strike
    console.log("Identified ATM Strike:", this.atmStrike); // Log the identified ATM Strike
  }
}


export const paytmSocketStore = new PaytmSocketStore();
