export interface PE_CE {
    strikePrice: number;
    expiryDate: string;
    underlying: string;
    identifier: string;
    openInterest: number;
    changeinOpenInterest: number;
    pchangeinOpenInterest: number;
    totalTradedVolume: number;
    impliedVolatility: number;
    lastPrice: number;
    change: number;
    pChange: number;
    totalBuyQuantity: number;
    totalSellQuantity: number;
    bidQty: number;
    bidprice: number;
    askQty: number;
    askPrice: number;
    underlyingValue: number;
    delta: number;
    gamma: number;
    vega: number;
    theta: number;
  }

  export interface OptionChainData {
    PE?: PE_CE;
    CE?: PE_CE;
    // Add other properties as needed
  }
  
  export interface OptionData {
    strikePrice: number;
    expiryDate: string;
    underlyingValue: number;
    CE?: PE_CE;
    PE?: PE_CE;
  }
  
  export interface ApiResponse {
    expiry_date: string[];
    nse_option_data: OptionData[];
  }

  export interface PEData {
    strikePrice: number;
    expiryDate: string;
    underlying: string;
    identifier: string;
    openInterest: number;
    changeinOpenInterest: number;
    pchangeinOpenInterest: number;
    totalTradedVolume: number;
    impliedVolatility: number;
    lastPrice: number;
    change: number;
    pChange: number;
    totalBuyQuantity: number;
    totalSellQuantity: number;
    bidQty: number;
    bidprice: number;
    askQty: number;
    askPrice: number;
    underlyingValue: number;
    delta: number;
    gamma: number;
    vega: number;
    theta: number;
  }
  
  export interface CEData {
    CE:string;
    PE:string;
    strikePrice: number;
    expiryDate: string;
    underlying: string;
    identifier: string;
    openInterest: number;
    changeinOpenInterest: number;
    pchangeinOpenInterest: number;
    totalTradedVolume: number;
    impliedVolatility: number;
    lastPrice: number;
    change: number;
    pChange: number;
    totalBuyQuantity: number;
    totalSellQuantity: number;
    bidQty: number;
    bidprice: number;
    askQty: number;
    askPrice: number;
    underlyingValue: number;
    delta: number;
    gamma: number;
    vega: number;
    theta: number;
  }
  