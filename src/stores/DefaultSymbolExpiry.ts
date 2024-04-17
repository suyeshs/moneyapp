import { makeObservable, observable, action } from 'mobx';

export class SymbolExpiryStore {
  expiryDates: string[] = [];
  symbols: string[] = [];
  isLoading: boolean = false;
  isFetching: boolean = false; // New flag to track ongoing fetch requests

  constructor() {
    makeObservable(this, {
      expiryDates: observable,
      isLoading: observable,
      isFetching: observable, // Make isFetching observable
      setExpiryDates: action,
      fetchExpiryDatesForSymbol: action,
      fetchSymbols: action,
      setSymbols: action,
    });
  }

  setSymbols(symbols: string[]): void {
    this.symbols = symbols.map(symbol => symbol.toUpperCase());
  }
  fetchSymbols = async () => {
    this.isLoading = true;
  
    try {
      // Hardcoded symbols
      const symbolData = [
        "BANKNIFTY",
        "FINNIFTY",
        "MIDCPNIFTY",
        "NIFTY",
        "AARTIIND",
        "ABB",
        "ABBOTINDIA",
        "ABCAPITAL",
        "ABFRL",
        "ACC",
        "ADANIENT",
        "ADANIPORTS",
        "ALKEM",
        "AMBUJACEM",
        "APOLLOHOSP",
        "APOLLOTYRE",
        "ASHOKLEY",
        "ASIANPAINT",
        "ASTRAL",
        "ATUL",
        "AUBANK",
        "AUROPHARMA",
        "AXISBANK",
        "BAJAJ-AUTO",
        "BAJAJFINSV",
        "BAJFINANCE",
        "BALKRISIND",
        "BALRAMCHIN",
        "BANDHANBNK",
        "BANKBARODA",
        "BATAINDIA",
        "BEL",
        "BERGEPAINT",
        "BHARATFORG",
        "BHARTIARTL",
        "BHEL",
        "BIOCON",
        "BOSCHLTD",
        "BPCL",
        "BRITANNIA",
        "BSOFT",
        "CANBK",
        "CANFINHOME",
        "CHAMBLFERT",
        "CHOLAFIN",
        "CIPLA",
        "COALINDIA",
        "COFORGE",
        "COLPAL",
        "CONCOR",
        "COROMANDEL",
        "CROMPTON",
        "CUB",
        "CUMMINSIND",
        "DABUR",
        "DALBHARAT",
        "DEEPAKNTR",
        "DELTACORP",
        "DIVISLAB",
        "DIXON",
        "DLF",
        "DRREDDY",
        "EICHERMOT",
        "ESCORTS",
        "EXIDEIND",
        "FEDERALBNK",
        "GAIL",
        "GLENMARK",
        "GMRINFRA",
        "GNFC",
        "GODREJCP",
        "GODREJPROP",
        "GRANULES",
        "GRASIM",
        "GUJGASLTD",
        "HAL",
        "HAVELLS",
        "HCLTECH",
        "HDFCAMC",
        "HDFCBANK",
        "HDFCLIFE",
        "HEROMOTOCO",
        "HINDALCO",
        "HINDCOPPER",
        "HINDPETRO",
        "HINDUNILVR",
        "IBULHSGFIN",
        "ICICIBANK",
        "ICICIGI",
        "ICICIPRULI",
        "IDEA",
        "IDFC",
        "IDFCFIRSTB",
        "IEX",
        "IGL",
        "INDHOTEL",
        "INDIACEM",
        "INDIAMART",
        "INDIGO",
        "INDUSINDBK",
        "INDUSTOWER",
        "INFY",
        "IOC",
        "IPCALAB",
        "IRCTC",
        "ITC",
        "JINDALSTEL",
        "JKCEMENT",
        "JSWSTEEL",
        "JUBLFOOD",
        "KOTAKBANK",
        "L&TFH",
        "LALPATHLAB",
        "LAURUSLABS",
        "LICHSGFIN",
        "LT",
        "LTIM",
        "LTTS",
        "LUPIN",
        "M&M",
        "M&MFIN",
        "MANAPPURAM",
        "MARICO",
        "MARUTI",
        "MCDOWELL-N",
        "MCX",
        "METROPOLIS",
        "MFSL",
        "MGL",
        "MOTHERSON",
        "MPHASIS",
        "MRF",
        "MUTHOOTFIN",
        "NATIONALUM",
        "NAUKRI",
        "NAVINFLUOR",
        "NESTLEIND",
        "NMDC",
        "NTPC",
        "OBEROIRLTY",
        "OFSS",
        "ONGC",
        "PAGEIND",
        "PEL",
        "PERSISTENT",
        "PETRONET",
        "PFC",
        "PIDILITIND",
        "PIIND",
        "PNB",
        "POLYCAB",
        "POWERGRID",
        "PVRINOX",
        "RAMCOCEM",
        "RBLBANK",
        "RECLTD",
        "RELIANCE",
        "SAIL",
        "SBICARD",
        "SBILIFE",
        "SBIN",
        "SHREECEM",
        "SHRIRAMFIN",
        "SIEMENS",
        "SRF",
        "SUNPHARMA",
        "SUNTV",
        "SYNGENE",
        "TATACHEM",
        "TATACOMM",
        "TATACONSUM",
        "TATAMOTORS",
        "TATAPOWER",
        "TATASTEEL",
        "TCS",
        "TECHM",
        "TITAN",
        "TORNTPHARM",
        "TRENT",
        "TVSMOTOR",
        "UBL",
        "ULTRACEMCO",
        "UPL",
        "VEDL",
        "VOLTAS",
        "WIPRO",
        "ZEEL",
        "ZYDUSLIFE"
      ];
  
      if (Array.isArray(symbolData)) {
        this.setSymbols(symbolData);
        console.log(this.symbols);  // Log the symbols
      } else {
        throw new Error('Symbols not found');
      }
    } catch (error) {
      console.error('Error fetching symbols:', error);
    } finally {
      this.isLoading = false;
    }
  };
  // This is the missing closing brace



  setExpiryDates(dates: string[]): void {
    this.expiryDates = dates;
  }



  fetchExpiryDatesForSymbol = async (symbol: string = "NIFTY") => {
    if (this.isFetching) return; // If a request is already in progress, return immediately

    this.isFetching = true; // Set the flag to true when a request starts
    this.isLoading = true;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/get-expiry?symbol=${symbol}`);
      //const response = await fetch(`https://tradepodjango.suyeshs.repl.co/api/get-expiry?symbol=${symbol}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      const expiryDates = data.expiry_dates; // Extract expiry_dates from response
      this.setExpiryDates(expiryDates);
    } catch (error) {
      console.error(`Error fetching expiry dates for symbol: ${symbol}`, error);
    } finally {
      this.isLoading = false;
      this.isFetching = false; // Reset the flag when the request is done
    }
  };
}



export const initializeSymbolExpiryStore = (): SymbolExpiryStore => {
  return new SymbolExpiryStore();
};

