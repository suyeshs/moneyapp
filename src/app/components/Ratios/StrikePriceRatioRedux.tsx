import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { OptionData } from "../../../types"; // Adjust the path accordingly
import { RootState } from "../../../stores/store"; // Import RootState type
import { setData, updateData } from '../../../stores/websocketSlice';

import styles from "../../styles/table.module.css";
import Spinner from "../../components/spinner";


interface Totals {
  totalCEOpenInterest: number;
  totalCETotalTradedVolume: number;
  totalPEOpenInterest: number;
  totalPETotalTradedVolume: number;
}
const StrikePriceRatioTable: React.FC = () => {
  const dispatch = useDispatch();
  const gridData = useSelector((state: RootState) => state.websocket.data);
  //console.log("gridData", gridData);
  const [isInitialLoadCompleted, setIsInitialLoadCompleted] = useState(false);

  useEffect(() => {
    console.log("SyncGrid Component Mounted");
    const socket = new WebSocket('ws://127.0.0.1:8888/tradepod');

    socket.onopen = () => { 
      console.log("WebSocket Connected");
    };

    socket.onmessage = (event) => {
      const data: OptionData = JSON.parse(event.data);
      console.log("Data received:", data);

      if (!isInitialLoadCompleted) {
        setTempData(currentData => [...currentData, data]);
        if (data.strikePrice === 23700) {
          dispatch(setData(tempData));
          setIsInitialLoadCompleted(true);
        }
      } else {
        dispatch(updateData(data));
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket Disconnected");
    };

    return () => {
      console.log("Closing WebSocket");
      socket.close();
    };
  }, [dispatch, isInitialLoadCompleted]);

  console.log(isInitialLoadCompleted);
  const [tempData, setTempData] = useState<OptionData[]>([]);
  const underlyingValue = gridData[0]?.underlyingValue;
// Now you have an array of underlying values corresponding to each OptionData object in gridData
console.log("Underlying Values:", underlyingValue);


  

 

  const calculateATMStrikePrice = (underlyingValue: number): number => {
    // Round the underlying value to the nearest 50
    return Math.round(underlyingValue / 50) * 50;
  };
  const getATMStrikePrice = (underlyingValue: number | null): number => {
    if (underlyingValue === null) {
      return 0;
    }
    return calculateATMStrikePrice(underlyingValue);
  };

  const atmStrikePrice = getATMStrikePrice(underlyingValue);
  console.log("ATM Strike Price", atmStrikePrice);

  const calculateRatio = (): { strikePrice: number; ratio: number }[] => {
    const ratios: { strikePrice: number; ratio: number }[] = [];

    gridData.forEach((option: OptionData) => {
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
  //console.log("Ratios", ratios);


  

  

  const calculateITMOICE = (): { ITMOICE: number; ITMOICCE: number, ITMOIPE: number; ITMOICPE: number, ITMCEVOL: number, ITMPEVOL: number } => {
    let ITMOICE = 0;
    let ITMOICCE = 0;
    let ITMOIPE = 0;
    let ITMOICPE = 0; 
    let ITMCEVOL = 0;
    let ITMPEVOL = 0;
    console.log("ATM Strike Price", atmStrikePrice);

    gridData.forEach((option: OptionData) => {
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
  console.log("ITM VOL", ITMCEVOL);

  const calculateOTMOIPE = (): { OTMOICE: number, OTMOICCE: number ,OTMOIPE: number; OTMOICPE: number , OTMCEVOL: number, OTMPEVOL: number } => {
    let OTMOICE = 0;
    let OTMOICCE = 0;
    let OTMOIPE = 0;
    let OTMOICPE = 0;
    let OTMCEVOL = 0;
    let OTMPEVOL = 0;
    console.log("ATM Strike Price", atmStrikePrice);
    gridData.forEach((option: OptionData) => {
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
  console.log("OTM VOL", OTMPEVOL);

  const PCRITMOI = (ITMOICE / ITMOIPE).toFixed(2);
  const PCRITMCHGOI = (ITMOICCE / ITMOICPE).toFixed(2);

  const calculateTotals = () => {

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


  
  

  return (
    <div >

<div className= {styles.table}>
      <table>
        <thead>
          <tr>
            <th colSpan={2}>TOTALS</th>
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
            <td>{(totalCEOpenInterest / 1000000).toLocaleString()} Cr</td>
            <td>{(totalCETotalTradedVolume / 1000000).toLocaleString()} Cr</td>
          </tr>
          <tr>
            <td>PE</td>
            <td>{((totalPEOpenInterest)/ 100000).toLocaleString()} Cr</td>
            <td>{totalPETotalTradedVolume}</td>
          </tr>
          
        </tbody>
      </table>
    </div>
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
            <td>{(ITMOICE / 1000000).toLocaleString()} Cr</td>
            <td>{(ITMOIPE / 1000000).toLocaleString()} Cr</td>
            <td>{((ITMOICE - ITMOIPE) / 1000000).toLocaleString()} Cr</td>
          </tr>
          <tr>
            <td>ITM OI Change</td>
            <td>{((ITMOICCE)/ 100000).toLocaleString()} Cr</td>
            <td>{ITMOICPE}</td>
            <td>{((ITMOICCE - ITMOICPE)/ 1000000).toLocaleString()} Cr</td>
          </tr>
          <tr>
            <td>ITM Vol</td>
            <td>{ITMCEVOL}</td>
            <td>{ITMPEVOL}</td>
            <td>{((ITMCEVOL - ITMPEVOL)/ 100000).toLocaleString()} Cr</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div className= {styles.table} >
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
            <td>{(OTMOICE / 1000000).toLocaleString()} Cr</td>
            <td>{(OTMOIPE / 1000000).toLocaleString()} Cr</td>
            <td>{((OTMOICE - OTMOIPE) / 1000000).toLocaleString()} Cr</td>
          </tr>
          <tr>
            <td>Total OTM OI change</td>
            <td>{OTMOICE}</td>
            <td>{OTMOICPE}</td>
            <td>{((OTMOICE - OTMOICPE)/ 100000).toLocaleString()} Cr</td>
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
     
      
    
  );
};

export default StrikePriceRatioTable;
