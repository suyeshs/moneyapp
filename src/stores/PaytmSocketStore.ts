import { makeAutoObservable, autorun, action } from "mobx";
import { OptionData } from "../types";

class PaytmSocketStore {
  isLoading: boolean = false;
  loading: boolean = false; // Add a loading property
  symbol: string = "";
  data: OptionData[] = [];
  atmStrike: boolean | null = null;
  underlyingValue: number | null = null; // Add the underlyingValue property
  setExpiryDate: string = "";


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
    } else {
      this.isLoading = true;
    }
  });

  // Define an action to update the loading state
  setLoading = action((isLoading: boolean) => {
    this.isLoading = isLoading;
  });


}


export const paytmSocketStore = new PaytmSocketStore();
