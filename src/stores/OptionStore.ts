import { makeAutoObservable } from 'mobx'

interface OptionData {
  exchange_code: string;
  product_type: string;
  stock_code: string;
  expiry_date: string;
  right: string;
  strike_price: number;
  ltp: number;
  ltt: string;
  best_bid_price: number;
  best_bid_quantity: string;
  best_offer_price: number;
  best_offer_quantity: string;
  open: number;
  high: number;
  low: number;
  previous_close: number;
  ltp_percent_change: number;
  upper_circuit: number;
  lower_circuit: number;
  total_quantity_traded: string;
  spot_price: string;
  ltq: string;
  open_interest: number;
  chnge_oi: number;
  total_buy_qty: string;
  total_sell_qty: string;
 
}

interface RecordData {
  strikePrice: number;
  expiryDate: string;
  callOption?: OptionData;
  putOption?: OptionData;
}


export class OptionStore {
  data: RecordData[] = [];
  lastRefresh: string = '';
  intervalId?: NodeJS.Timeout;
  atmStrikeIndex: number | null = null; // added this line
  atmStrike: number | null = null; // new line

  constructor() {
    makeAutoObservable(this);
  }

  setOptions = (data: RecordData[]): void => {
    this.data = data;
  }
  getOptions = (): RecordData[] => {
    return this.data;
  }

  setLastRefresh = (lastRefresh: string): void => {
    this.lastRefresh = lastRefresh;
  }

  setAtmStrikeIndex = (index: number | null): void => {
    this.atmStrikeIndex = index;
  }

  calculateAtmStrike(): void {
    // calculate only if data is available
    if (this.data && this.data.length > 0) {
      // We fetch the spot_price from the first item in the data array
      let spotPrice = parseFloat(this.data[0]?.callOption?.spot_price || this.data[0]?.putOption?.spot_price || "0");
      // We round the spot price to the nearest 50
      this.atmStrike = this.roundHalfUp(spotPrice, 50);
  
      // find the index of the atm strike price
      const index = this.data.findIndex(item => item.strikePrice === this.atmStrike);
      // set the index
      this.setAtmStrikeIndex(index);
      console.log('atmStrike:', this.atmStrike);
      console.log('atmStrikeIndex:', this.atmStrikeIndex);
    }
  }
  

  

  getDataAtIndex(index: number): RecordData | null {
    if(this.data && this.data.length > index) {
      return this.data[index];
    } else {
      return null;
    }
  }

  private roundHalfUp(strikePrice: number, base: number): number {
    return Math.sign(strikePrice) * Math.round(Math.abs(strikePrice) / base) * base;
  }

  startFetchingData = (): void => {
    this.fetchData();

    this.intervalId = setInterval(() => {
      this.fetchData();
    }, 10000 * 1000); // fetch every 10 seconds
  }

  stopFetchingData = (): void => {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

    fetchData = async (): Promise<void> => {
      console.log("Starting fetch operation...");
      try {
        const response = await fetch('http://127.0.0.1:8000/api/breeze-test?stock_code=NIFTY&exchange_code=NFO&product_type=options&expiry_date=10-Aug-2023');
        console.log("Fetch operation completed. Processing response...");
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const responseData = await response.json();
        console.log("Response data received and parsed: ", responseData);
    
        // Merge call and put option chain data based on strike price and expiry date
        let mergedData: RecordData[] = responseData.call_option_chain_data.map((callOption: OptionData) => {
          const matchingPutOption = responseData.put_option_chain_data.find(
            (putOption: OptionData) =>
              putOption.strike_price === callOption.strike_price &&
              putOption.expiry_date === callOption.expiry_date
          );
    
          return {
            strikePrice: callOption.strike_price,
            expiryDate: callOption.expiry_date,
            callOption,
            putOption: matchingPutOption,
          };
        });
    
        console.log("Merging call and put option data: ", mergedData);
    
        // Filter out the rows where OI is zero
        mergedData = mergedData.filter(record => {
          return record.callOption?.open_interest !== 0 && record.putOption?.open_interest !== 0;
        });
    
        this.setOptions(mergedData);
        console.log("Data successfully set to store");
        this.calculateAtmStrike(); // add calculateAtmStrike here
        this.setLastRefresh(new Date().toISOString());
       
      
      } catch (error) {
        console.log("Error during fetch operation: ", error);
      }
    }
  }

export const optionStore = new OptionStore();
