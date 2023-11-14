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
    underlyingValue: number;
    [key: string]: number | string | undefined | boolean | null;
    atmIndex?: number;
    StrikeATM?: boolean;
    isLastRecord? : boolean;
    rowIndex?: number;
    data?: any;
    lot_size?: number;

}

export interface OptionDataRow {
    expiryDate?: string; // This can be either a string or undefined
    rowIndex: number;
  
    CE_openInterest?: number;
    CE_changeinOpenInterest?: number;
    CE_vega?: number;
    CE_lastPrice?: number;
    CE_delta?: number;
    CE_totalTradedVolume?: number;
    CE_gamma?: number;
    CE_impliedVolatility?: number;
    CE_theta?: number;
    // ... define other properties as needed
    strikePrice?: number;
    PE_openInterest?: number;
    PE_changeinOpenInterest?: number;
    PE_lastPrice?: number;
    PE_totalTradedVolume?: number;
    PE_impliedVolatility?: number;
    PE_vega?: number;
    PE_gamma?: number;
    PE_theta?: number;
    PE_delta?: number;
    PE_calcIV?: number;
    lot_size?: number;

    // ... define other properties as needed
  }