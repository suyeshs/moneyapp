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
  greeks: {
    delta: number;
    gamma: number;
    vega: number;
    theta: number;
  };
}

interface AuthData {
  // Add properties for user authentication data (idinfo)
  // For example:
  userId: string;
  email: string;
  // ...
}


export class OptionStore {
  data: OptionData[] = [];
  error: string | null = null;
  lastRefresh: string = '';
  isClient: boolean = false;
  isAuthenticated: boolean = false;
  userData: AuthData | null = null; // User authentication data

  constructor() {
    makeAutoObservable(this);
  }

  setData = (data: OptionData[]): void => {
    this.data = data;
  }

  setError = (error: string | null): void => {
    this.error = error;
  }

  setLastRefresh = (lastRefresh: string): void => {
    this.lastRefresh = lastRefresh;
  }

  setIsClient = (isClient: boolean): void => {
    this.isClient = isClient;
  }

  setAuthenticated = (isAuthenticated: boolean): void => {
    this.isAuthenticated = isAuthenticated;
  }

  setUserData = (userData: AuthData | null): void => {
    this.userData = userData;
  }
}

export const optionStore = new OptionStore();
