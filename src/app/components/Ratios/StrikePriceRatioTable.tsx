  // Import necessary dependencies
  import React, { useState, useEffect } from "react";
  import { observer } from "mobx-react";
  import { paytmSocketStore } from "../../../stores/PaytmSocketStore"; // Adjust the path accordingly
  import { OptionData } from "../../../types"; // Adjust the path accordingly
  import styles from "./table.module.css";
  import Spinner from "../../components/spinner";

  interface Totals {
    totalCEOpenInterest: number;
    totalCETotalTradedVolume: number;
    totalPEOpenInterest: number;
    totalPETotalTradedVolume: number;
    
  }

  interface RangeTotals {
    rangeTotalCEOpenInterest: number,
    rangeTotalCETotalTradedVolume: number,
    rangeTotalPEOpenInterest: number,
    rangeTotalPETotalTradedVolume: number,
  }

  interface StrikePriceRatioTableProps {
    selectedRange: number | "All";
  }



  // create a functional component
  const StrikePriceRatioTable = observer(({ selectedRange }: StrikePriceRatioTableProps) => {
    console.log("StrikePriceRatioTable called");
    const { data, isInitialLoadCompleted } = paytmSocketStore;

    // Check if there is no data
    if (!data.length) {
      return (
        <div>{isInitialLoadCompleted ? <Spinner /> : "No data available"}</div>
      );
    }
    //console.log (data)

    if (!paytmSocketStore.isInitialLoadCompleted) {
      // Return a loading indicator or null if the initial load is not completed
      return null;
    }

    //console.log(data);

    const calculateATMStrikePrice = (underlyingValue: number): number => {
      // Round the underlying value to the nearest 50
      return Math.round(underlyingValue / 50) * 50;
    };
    //console.log(underlyingValue);
    const getATMStrikePrice = (underlyingValue: number | null): number => {
      // If underlyingValue is null, return a default value or handle the case accordingly
      if (underlyingValue === null) {
        // Return a default value or throw an error or handle the case as per your requirement
        return 0; // Default value, replace with appropriate handling
      }

      // Otherwise, calculate and return the ATM strike price
      return calculateATMStrikePrice(underlyingValue);
    };

    // Map over the data to create rows
    const atmStrikePrice = getATMStrikePrice(paytmSocketStore.underlyingValue);

    // Function to calculate Pcr based on the selected range
    const calculateSelectdPcr = (data: OptionData[], selectedRange: 3 | 5 | 10 | "All"): number => {
      let totalPutOpenInterest = 0;
      let totalCallOpenInterest = 0;
    
      // Calculate total open interest for put options and call options based on the selected range
      data.forEach((option: OptionData) => {
        if (selectedRange === "All" || Math.abs(option.strikePrice - atmStrikePrice) <= selectedRange) {
          if (option.PE_openInterest !== undefined) {
            totalPutOpenInterest += option.PE_openInterest;
          }
          if (option.CE_openInterest !== undefined) {
            totalCallOpenInterest += option.CE_openInterest;
          }
        }
      });
    
      // Calculate Pcr
      const selectpcr = totalPutOpenInterest / totalCallOpenInterest;
    
      return isNaN(selectpcr) ? 0 : selectpcr; // Return 0 if the calculation results in NaN
    };

  const selectpcr = calculateSelectdPcr(data, selectedRange as "All" | 3 | 5 | 10);
  console.log(selectpcr);

    

    const calculateRatio = (): { strikePrice: number; ratio: number }[] => {
      const ratios: { strikePrice: number; ratio: number }[] = [];

      data.forEach((option: OptionData) => {
        if (
          option.PE_openInterest !== undefined &&
          option.PE_lastPrice !== undefined &&
          option.CE_openInterest !== undefined &&
          option.CE_lastPrice !== undefined &&
          option.CE_totalTradedVolume !== undefined &&
          option.PE_totalTradedVolume !== undefined &&
          option.CE_openInterest !== 0
          
        ) {
          const ratio = {
            strikePrice: option.strikePrice,
            ratio:
              (option.PE_openInterest * option.PE_lastPrice) /
              (option.CE_openInterest * option.CE_lastPrice),
          };
          ratios.push(ratio);
        }
      });

      return ratios;
    };

    const ratios = calculateRatio();

    const calculateITMOICE = (): { ITMOICE: number; ITMOICCE: number, ITMOIPE: number; ITMOICPE: number, ITMCEVOL: number, ITMPEVOL: number } => {
      let ITMOICE = 0;
      let ITMOICCE = 0;
      let ITMOIPE = 0;
      let ITMOICPE = 0; 
      let ITMCEVOL = 0;
      let ITMPEVOL = 0;
      

      data.forEach((option: OptionData) => {
        if (option.strikePrice > atmStrikePrice) {
          ITMOICE += option.CE_openInterest ?? 0;
          ITMOICCE += option.CE_changeinOpenInterest ?? 0;
          ITMOIPE += option.PE_openInterest ?? 0;
          ITMOICPE += option.PE_changeinOpenInterest ?? 0;
          ITMPEVOL += option.PE_totalTradedVolume ?? 0;
          ITMCEVOL += option.CE_totalTradedVolume ?? 0;

        }
      });

      return { ITMOICE, ITMOICCE, ITMOIPE, ITMOICPE, ITMCEVOL, ITMPEVOL};
    };

    const { ITMOICE, ITMOICCE, ITMOIPE, ITMOICPE, ITMCEVOL, ITMPEVOL } = calculateITMOICE();
    

    const calculateOTMOIPE = (): { OTMOICE: number, OTMOICCE: number ,OTMOIPE: number; OTMOICPE: number , OTMCEVOL: number, OTMPEVOL: number } => {
      let OTMOICE = 0;
      let OTMOICCE = 0;
      let OTMOIPE = 0;
      let OTMOICPE = 0;
      let OTMCEVOL = 0;
      let OTMPEVOL = 0;
      
      data.forEach((option: OptionData) => {
        if (option.strikePrice < atmStrikePrice) {
          OTMOICE += option.CE_openInterest ?? 0;
          OTMOICCE += option.CE_changeinOpenInterest ?? 0;
          OTMOIPE += option.PE_openInterest ?? 0;
          OTMOICPE += option.PE_changeinOpenInterest ?? 0;
          OTMCEVOL += option.CE_totalTradedVolume ?? 0;
          OTMPEVOL += option.PE_totalTradedVolume ?? 0;
        }
      });
      return { OTMOICE, OTMOICCE,OTMOIPE, OTMOICPE, OTMCEVOL, OTMPEVOL};
    };

    const { OTMOICE,OTMOIPE, OTMOICCE, OTMOICPE, OTMCEVOL, OTMPEVOL } = calculateOTMOIPE();
    

    const PcrITMOI = (ITMOICE / ITMOIPE).toFixed(2);
    const PcrITMCHGOI = (ITMOICCE / ITMOICPE).toFixed(2);

    const calculateTotals = (): Totals => {

      const totalCEOpenInterest = ITMOICE + OTMOICE;
      const totalCETotalTradedVolume = ITMCEVOL + OTMCEVOL;
      const totalPEOpenInterest = ITMOIPE + OTMOIPE;
      const totalPETotalTradedVolume = ITMPEVOL + OTMPEVOL;

      return {
        totalCEOpenInterest,
        totalCETotalTradedVolume,
        totalPEOpenInterest,
        totalPETotalTradedVolume,
      };
    };
    const { totalCEOpenInterest,totalCETotalTradedVolume, totalPEOpenInterest, totalPETotalTradedVolume} =  calculateTotals();

    // Inside your functional component
const [rangeTotals, setRangeTotals,] = useState<RangeTotals>({
  rangeTotalCEOpenInterest: 0,
  rangeTotalCETotalTradedVolume: 0,
  rangeTotalPEOpenInterest: 0,
  rangeTotalPETotalTradedVolume: 0
});

useEffect(() => {
  const calculateTotalsInRange = (data: OptionData[], selectedRange: 3 | 5 | 10 | "All"): RangeTotals => {
    let rangeTotalCEOpenInterest = 0;
    let rangeTotalCETotalTradedVolume = 0;
    let rangeTotalPEOpenInterest = 0;
    let rangeTotalPETotalTradedVolume = 0;
  
    const isOptionWithinRange = (option: OptionData) => {
      return (
        selectedRange === "All" ||
        (selectedRange === 3 && Math.abs(option.strikePrice - atmStrikePrice) <= 3) ||
        (selectedRange === 5 && Math.abs(option.strikePrice - atmStrikePrice) <= 5) ||
        (selectedRange === 10 && Math.abs(option.strikePrice - atmStrikePrice) <= 10)
      );
    };
  
    data.forEach((option: OptionData) => {
      if (isOptionWithinRange(option)) {
        if (option.CE_openInterest !== undefined) {
          rangeTotalCEOpenInterest += option.CE_openInterest;
        }
        if (option.CE_totalTradedVolume !== undefined) {
          rangeTotalCETotalTradedVolume += option.CE_totalTradedVolume;
        }
        if (option.PE_openInterest !== undefined) {
          rangeTotalPEOpenInterest += option.PE_openInterest;
        }
        if (option.PE_totalTradedVolume !== undefined) {
          rangeTotalPETotalTradedVolume += option.PE_totalTradedVolume;
        }
      }
    });
  
    return {
      rangeTotalCEOpenInterest,
      rangeTotalCETotalTradedVolume,
      rangeTotalPEOpenInterest,
      rangeTotalPETotalTradedVolume,
    };
  };
  

  const newRangeTotals = calculateTotalsInRange(data, selectedRange as 3 | 5 | 10 | "All");
  setRangeTotals(newRangeTotals); // Here use setRangeTotals instead of newRangeTotals
}, [data, selectedRange, atmStrikePrice, totalCEOpenInterest, totalCETotalTradedVolume, totalPEOpenInterest, totalPETotalTradedVolume]);




  


    


    

    return (
      <div >
          <div className= {styles.grid}>
            <div className= {styles.table}>
                  <table>
                    <thead>
                      <tr>
                        <th colSpan={3}>TOTALS</th>
                      </tr>
                      <tr>
                        <th></th>
                        <th>OI Total</th>
                        <th>VOL Total</th>
                        
                      </tr> 
                    </thead>
                    <tbody>
                      <tr>
                        <td>CE</td>
                        <td>{(totalCEOpenInterest / 1000000).toFixed(2)} cr</td>
                        <td>{(totalCETotalTradedVolume / 1000000).toFixed(2)} cr</td>
                      </tr>
                      <tr>
                        <td>PE</td>
                        <td>{((totalPEOpenInterest)/ 100000).toFixed(2)} cr</td>
                        <td>{(totalPETotalTradedVolume/ 1000000).toFixed(2)} cr</td>
                      </tr>
                      
                    </tbody>
                  </table>
                </div>
                <div className= {styles.table}>
                <table>
                    <thead>
                      <tr>
                        <th colSpan={3}>TOTALS  Range</th>
                      </tr>
                      <tr>
                        <th></th>
                        <th>OI Total</th>
                        <th>VOL Total</th>
                        
                      </tr>
                    </thead>
                    <tbody>
                    <tr>
                      <td>CE</td>
                      <td>{(rangeTotals.rangeTotalCEOpenInterest / 1000000).toFixed(2)} cr</td>
                      <td>{(rangeTotals.rangeTotalCETotalTradedVolume / 1000000).toFixed(2)} cr</td>
                    </tr>
                    <tr>
                      <td>PE</td>
                      <td>{((rangeTotals.rangeTotalPEOpenInterest) / 100000).toFixed(2)} cr</td>
                      <td>{((rangeTotals.rangeTotalPETotalTradedVolume) / 100000).toFixed(2)} cr</td>
                    </tr>
                  </tbody>

                  </table>


                </div>
          </div>
          

      
    <div className= {styles.grid}>
    <div className= {styles.table}>
        <table>
          <thead>
            <tr>
              <th colSpan={5}>ITM</th>
            </tr>
            <tr>
              <th>Stat</th>
              <th>Call</th>
              <th>Put</th>
              <th>Net</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Total ITM OI</td>
              <td>{(ITMOICE / 1000000).toFixed(2)} cr</td>
              <td>{(ITMOIPE / 1000000).toFixed(2)} cr</td>
              <td>{((ITMOICE - ITMOIPE) / 1000000).toFixed(2)} cr</td>

            </tr>
            <tr>
              <td>ITM OI Change</td>
              <td>{((ITMOICCE)/ 100000).toFixed(2)} cr</td>
              <td>{ITMOICPE}</td>
              <td>{((ITMOICCE - ITMOICPE)/ 1000000).toFixed(2)} cr</td>
            </tr>
            <tr>
              <td>ITM Vol</td>
              <td>{(ITMCEVOL / 100000). toFixed(2)}</td>
              <td>{(ITMPEVOL /100000). toFixed(2)}</td>
              <td>{((ITMCEVOL - ITMPEVOL)/ 100000).toFixed(2)} cr</td>
            </tr>
          </tbody>
        </table>

        
      </div>

      <div className= {styles.table} >
        <div>
        <table>
          <thead>
            <tr>
              <th colSpan={5}>OTM</th>
            </tr>
            <tr>
              <th>Stat</th>
              <th>Call</th>
              <th>Put</th>
              <th>Net</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Total OTM OI</td>
              <td>{(OTMOICE / 1000000).toFixed(2)} cr</td>
              <td>{(OTMOIPE / 1000000).toFixed(2)} cr</td>
              <td>{((OTMOICE - OTMOIPE) / 1000000).toFixed(2)} cr</td>
            </tr>
            <tr>
              <td>Total OTM OI change</td>
              <td>{OTMOICE}</td>
              <td>{OTMOICPE}</td>
              <td>{((OTMOICE - OTMOICPE)/ 100000).toFixed(2)} cr</td>
            </tr>
            <tr>
              <td>Total ITM Volume</td>
              <td>{OTMCEVOL}</td>
              <td>{OTMPEVOL}</td>
              <td>{OTMCEVOL - OTMPEVOL}</td>
            </tr>
          </tbody>
        </table>
        </div>
        </div>
        <div>

          
        </div>
      </div>
    </div>
      
        
      
    );
  });

  export default StrikePriceRatioTable;
