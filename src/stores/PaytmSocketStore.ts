import { makeAutoObservable, autorun, action } from "mobx";
import { OptionData } from "../types";

class PaytmSocketStore {
  isLoading: boolean = false;
  symbol: string = "";
  data: OptionData[] = [];
  atmStrike: boolean | null = null;
  underlyingValue: number | null = null; // Add the underlyingValue property
  lot_size: number | null = null; // Add the lot_size property
  atmIndex: number | null = null; // Add the atmIndex property


    // Method to set the ATM Index
    setATMIndex = (index: number) => {
      this.atmIndex = index;
      // Any additional logic that needs to happen when atmIndex is set can go here
    };
  
  //setSymbol: any;
  //setExpiryDate: any;
  fetchData: any;
  setSymbol = action((newSymbol: string) => {
    this.symbol = newSymbol;
  });

  // Action to set the expiry date
  setExpiryDate = action((expiryDate: string) => {
    // implementation to set expiry date...
  });

  // Action to fetch expiry dates for the symbol
  fetchExpiryDatesForSymbol = action(async (symbol: string) => {
    // implementation to fetch expiry dates...
  });


  constructor() {
    makeAutoObservable(this);
    this.underlyingValue
   
  }

  

  // Define an action to update the data
  setData = action((newData: OptionData[]) => {
    if (newData && newData.length > 0) {
      //console.log("Data being set to the store:", newData);
      
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
        //console.log("Rounded Data being set to the store:", roundedItem);
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
