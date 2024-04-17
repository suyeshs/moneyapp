import React, { useEffect, useState, useMemo  } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../stores/store';
import { setData, updateData } from '../../../stores/websocketSlice';
import { OptionData } from "../../../types";
import styles from "../../styles/table.module.css";

const SyncGrid: React.FC = () => {
  const dispatch = useDispatch();
  const gridData = useSelector((state: RootState) => state.websocket.data);
  console.log("SyncGrid Component Rendering");
  const underlyingValue = useSelector((state: RootState) => state.websocket.underlyingValue); // Accessing underlying value
  const [atmStrikePrice, setATMStrikePrice] = useState(0); // State to store ATM strike price
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
        if (data.strikePrice === 22400) {
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


  useEffect(() => {
    if (underlyingValue !== null) {
      // Calculate ATM strike price when underlyingValue changes
      const calculateATMStrikePrice = (value: number): number => {
        return Math.round(value / 50) * 50;
      };
      setATMStrikePrice(calculateATMStrikePrice(underlyingValue));
    }
  }, [underlyingValue]);

  

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



  const headers = (
    <>
      <tr style={{ borderRight: "5px solid white" }}>
        <th
          style={{
            fontFamily: "sans-serif",
            backgroundColor: "#f2f2f2",
            textAlign: "center",
            verticalAlign: "middle",
          }}
        >
          OI
        </th>
        <th
          style={{
            fontFamily: "sans-serif",
            backgroundColor: "#f2f2f2",
            textAlign: "center",
            verticalAlign: "middle",
            fontWeight: "bold",
          }}
        >
          Volume
        </th>
        <th
          style={{
            fontFamily: "sans-serif",
            backgroundColor: "#f2f2f2",
            textAlign: "center",
            verticalAlign: "middle",
            fontWeight: "bold",
          }}
        >
          IV
        </th>
        <th
          style={{
            fontFamily: "sans-serif",
            backgroundColor: "#f2f2f2",
            textAlign: "center",
            verticalAlign: "middle",
            fontWeight: "bold",
          }}
        >
          Premium
        </th>
        <th
          style={{
            fontFamily: "sans-serif",
            backgroundColor: "#f2f2f2",
            textAlign: "center",
            verticalAlign: "middle",
            fontWeight: "bold",
          }}
        >
          StrikePrice
        </th>
        <th
          style={{
            fontFamily: "sans-serif",
            backgroundColor: "#f2f2f2",
            textAlign: "center",
            verticalAlign: "middle",
            fontWeight: "bold",
          }}
        >
          Premium
        </th>
        <th
          style={{
            fontFamily: "sans-serif",
            backgroundColor: "#f2f2f2",
            textAlign: "center",
            verticalAlign: "middle",
            fontWeight: "bold",
          }}
        >
          IV
        </th>
        <th
          style={{
            fontFamily: "sans-serif",
            backgroundColor: "#f2f2f2",
            textAlign: "center",
            verticalAlign: "middle",
            fontWeight: "bold",
          }}
        >
          Volume
        </th>
        <th
          style={{
            fontFamily: "sans-serif",
            backgroundColor: "#f2f2f2",
            textAlign: "center",
            verticalAlign: "middle",
            fontWeight: "bold",
          }}
        >
          OI
        </th>
      </tr>
      <tr></tr>
    </>
  );

  const renderRows = useMemo(() => {
    const atmIndex = gridData.findIndex((row) => row.strikePrice === atmStrikePrice);
    let startIndex = 0;
    let endIndex = gridData.length;
    
    return gridData.slice(startIndex, endIndex).map((item: OptionData, index: number) => {
      const rowIndex = startIndex + index;
      const isAboveStrikePriceRow = rowIndex < atmIndex;
      const isBelowStrikePriceRow = rowIndex > atmIndex;

      return (
        <tr key={String(item.strikePrice)} className={[
          styles.tableRow,
          isAboveStrikePriceRow ? styles.aboveStrikePriceRow : '',
          isBelowStrikePriceRow ? styles.belowStrikePriceRow : '',
        ].join(' ')}>
          {/* CE OI cell */}
          <td
            style={{
              textAlign: "center",
              verticalAlign: "middle",
              backgroundColor: isAboveStrikePriceRow ? "lightgrey" : "",
            }}
          >
            <div>
              {item.CE_openInterest?.toLocaleString() ?? ""} (
              {item.CE_changeinOpenInterest?.toLocaleString() ?? ""})
            </div>
            <div className={styles.grreksContainer}>
              <span className={styles.greekLabel}>Vega</span>
              <span className={styles.greekValue}>{item.CE_vega}</span>
            </div>
          </td>

          {/* Volume cell */}
          <td
            style={{
              textAlign: "center",
              verticalAlign: "middle",
              backgroundColor: isAboveStrikePriceRow ? "lightgrey" : "",
            }}
          >
            <div>{item.CE_totalTradedVolume?.toLocaleString() ?? ""}</div>
            <div className={styles.greekNumbers}>
              <span className={styles.greekLabel}>Gamma</span>
              <span className={styles.greekValue}>{item.CE_gamma}</span>
            </div>
          </td>

          {/* IV cell */}
          <td
            style={{
              textAlign: "center",
              verticalAlign: "middle",
              backgroundColor: isAboveStrikePriceRow ? "lightgrey" : "",
            }}
          >
            <div>{item.CE_impliedVolatility?.toLocaleString() ?? ""}</div>
            <div>
              <span className={styles.greekValue}>{item.CE_theta}</span>
            </div>
          </td>

          {/* Premium cell */}
          <td
            style={{
              textAlign: "center",
              verticalAlign: "middle",
              backgroundColor: isAboveStrikePriceRow ? "lightgrey" : "",
            }}
          >
            <div>{item.CE_lastPrice?.toLocaleString() ?? ""}</div>
            <div>
              <span className={styles.greekValue}>{item.CE_delta}</span>
            </div>
          </td>

          {/* StrikePrice cell */}
          <td
            style={{
              backgroundColor:
                atmStrikePrice === item.strikePrice ? "lightgrey" : "",
              textAlign: "center",
            }}
          >
            {item.strikePrice}
          </td>
          {/* Premium cell */}
          <td
            style={{
              textAlign: "center",
              verticalAlign: "middle",
              backgroundColor: isBelowStrikePriceRow ? "lightgrey" : "",
            }}
          >
            <div>{item.PE_lastPrice}</div>
            <div>
              <span className={styles.greekLabel}>{item.PE_delta}</span>
            </div>
          </td>

          {/* IV cell */}
          <td
            style={{
              textAlign: "center",
              verticalAlign: "middle",
              backgroundColor: isBelowStrikePriceRow ? "lightgrey" : "",
            }}
          >
            <div>{item.PE_impliedVolatility}</div>
            <div>
              <span className={styles.greekLabel}>{item.PE_theta}</span>
            </div>
          </td>
          {/* Volume cell */}
          <td
            style={{
              textAlign: "center",
              verticalAlign: "middle",
              backgroundColor: isBelowStrikePriceRow ? "lightgrey" : "",
            }}
          >
            <div>{item.PE_totalTradedVolume?.toLocaleString() ?? ""}</div>
            <div>
              <span className={styles.greekLabel}>Gamma{item.PE_gamma}</span>
            </div>
          </td>
          {/* PE OI cell */}
          <td
            style={{
              textAlign: "center",
              verticalAlign: "middle",
              backgroundColor: isBelowStrikePriceRow ? "lightgrey" : "",
            }}
          >
            <div>
              {item.PE_openInterest?.toLocaleString() ?? ""} (
              {item.PE_changeinOpenInterest?.toLocaleString() ?? ""})
            </div>
            <div>
              <span className={styles.greekLabel}>Vega{item.PE_vega}</span>
            </div>
          </td>
        </tr>
      );
    });
  }, [gridData, atmStrikePrice]);
  return (
    <table>
      <thead>
      {headers}
      </thead>
      <tbody>
        
      
      {renderRows}
    
      </tbody>
    </table>
  );
};

export default SyncGrid;
