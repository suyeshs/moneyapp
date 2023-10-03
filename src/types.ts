/**
 * Represents the response from the API.
 */
export interface ApiResponse {
  expiry_date: string[];          // Array of expiry dates
  expiry_dates: string []
  nse_option_data: OptionChainData[];  // Array of option chain data
}

/**
 * Represents the response from the API.
 */
export interface NseApiResponse {
  expiry_date: string[];          // Array of expiry dates
  expiry_dates: string []
  nse_options_data: NseOptionData[];  // Array of option chain data
}

export interface BreezeApiResponse {
  nse_options_data: BreezeOptionData[];  // Array of option chain data
}


/**
 * Represents the option chain data for a specific strike price and expiry date.
 */
export interface OptionChainData {
  strikePrice: number;   // Array of strike prices
  closestStrikePriceIndex: number;
  expiryDate: string;    // Array of expiry dates
  CE?: PE_CE;              // Call option details (optional)
  PE?: PE_CE;              // Put option details (optional)

}


/**
 * Represents the option chain data for a specific strike price and expiry date.
 */
export interface NseOptionChainData {
  strikePrice: number;   // Array of strike prices
  closestStrikePriceIndex: number;
  expiryDate: string;    // Array of expiry dates
  CE?: PE_CE;              // Call option details (optional)
  PE?: PE_CE;              // Put option details (optional)

}


/**
 * Represents the detailed information for a call option or put option.
 */
interface PE_CE {
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
  calc_iv: number; // Added this line
}

/**
 * Represents the flattened option data for a specific expiry date.
 */
export interface OptionData {
  expiryDate: string;                // Expiry date
  strikePrice: number;               // Strike price
  CE_openInterest?: number;          // Call option open interest
  CE_changeinOpenInterest?: number;       // Call option change in open interest value
  CE_pchangeinOpenInterest?: number;   // Call option change in open interest
  CE_lastPrice?: number;             // Call option last price
  CE_totalTradedVolume?: number;     // Call option total traded volume
  CE_impliedVolatility?: number;     // Call option implied volatility
  CE_change?: number;                // Call option price change
  CE_pChange?: number;               // Call option percentage price change
  CE_underlyingValue?: number;
  CE_strikePrice?: number;           // Call option strike price
  PE_underlyingValue?: number; 
  PE_openInterest?: number;          // Put option open interest
  PE_lastPrice?: number;             // Put option last price
  PE_totalTradedVolume?: number;     // Put option total traded volume
  PE_changeinOpenInterest?: number;  // Put option change in open interest
  PE_impliedVolatility?: number;     // Put option implied volatility
  PE_pChange?: number;               // Put option percentage price change
  PE_strikePrice?: number;           // Put option strike price
  CE_vega?: number;                  // Call option vega
  CE_gamma?: number;                 // Call option gamma
  CE_theta?: number;                 // Call option theta
  CE_delta?: number;                 // Call option delta
  PE_vega?: number;                  // Put option vega
  PE_gamma?: number;                 // Put option gamma
  PE_theta?: number;                 // Put option theta
  PE_delta?: number;                 // Put option delta
  CE_calcIV: number;  // Added this line
  PE_calcIV: number; // Added this line
    
}

/**
 * Represents the flattened option data for a specific expiry date.
 */
export interface NseOptionData {
  expiryDate: string;
  expiryDates: string | null;
  strikePrice: number;
  CE_openInterest: number;
  CE_changeinOpenInterest: number;
  CE_totalTradedVolume: number;
  CE_impliedVolatility: number;
  CE_lastPrice: number;
  CE_vega: number | null;
  CE_gamma: number | null;
  CE_theta: number | null;
  CE_delta: number | null;
  CE_underlyingValue: number;
  PE_openInterest: number;
  PE_lastPrice: number;
  PE_totalTradedVolume: number;
  PE_impliedVolatility: number;
  PE_changeinOpenInterest: number;
  PE_vega: number;
  PE_gamma: number;
  PE_theta: number;
  PE_delta: number;
  PE_underlyingValue: number;
  CE_calcIV: number | null;
  PE_calcIV: number;
  CE_OI: number;
  CE_VOLUME: number;
  PE_OI: number;
  PE_VOLUME: number;
}


interface GraphData {
  
  CE_strikePrice: number;
  CE_openInterest: number;
  CE_changeinOpenInterest: number;
  CE_delta: number;
  CE_gamma: number;
  CE_impliedVolatility: number;
  CE_lastPrice: number;
  CE_theta: number;
  CE_totalTradedVolume: number;
  CE_underlyingValue: number;
  CE_vega: number;
  PE_strikePrice: number;
  PE_changeinOpenInterest: number;
  PE_delta: number;
  PE_gamma: number;
  PE_impliedVolatility: number;
  PE_lastPrice: number;
  PE_openInterest: number;
  PE_theta: number;
  PE_totalTradedVolume: number;
  PE_underlyingValue: number;
  PE_vega: number;
}


interface SearchSelectInputProps {
  placeholder: string;
  options: string[];
}

interface CustomDropdownProps {
  placeholder?: string;
  listData?: string[];
}

/**
 * Represents the flattened option data for a specific expiry date.
 */
export interface BreezeOptionData {
  expiryDate: string;
  strikePrice: number;
  CE_openInterest: number;
  CE_changeinOpenInterest: number;
  CE_totalTradedVolume: number;
  CE_impliedVolatility: number;
  CE_lastPrice: number;
  CE_vega: number | null;
  CE_gamma: number | null;
  CE_theta: number | null;
  CE_delta: number | null;
  CE_underlyingValue: number;
  PE_openInterest: number;
  PE_lastPrice: number;
  PE_totalTradedVolume: number;
  PE_impliedVolatility: number;
  PE_changeinOpenInterest: number;
  PE_vega: number;
  PE_gamma: number;
  PE_theta: number;
  PE_delta: number;
  PE_underlyingValue: number;
  CE_calcIV: number | null;
  PE_calcIV: number;
  CE_OI: number;
  CE_VOLUME: number;
  PE_OI: number;
  PE_VOLUME: number;
}