import React from 'react';
import { OptionData } from '../../../types';
import styles from '../../styles/table.module.css';
import pcrpStore from '../../../stores/TotalsRatiosStore'; // Import the MobX store


interface Totals {
  totalCEOpenInterest: number;
  totalCETotalTradedVolume: number;
  totalPEOpenInterest: number;
  totalPETotalTradedVolume: number;
}



const TotalsCalculator: React.FC<{ data: OptionData[] }> = ({ data }) => {
  const calculateTotals = () => {
    let totalCEOpenInterest = 0;
    let totalCETotalTradedVolume = 0;
    let totalPEOpenInterest = 0;
    let totalPETotalTradedVolume = 0;

    data.forEach((item: OptionData) => {
      if (item.CE_openInterest !== undefined) {
        totalCEOpenInterest += item.CE_openInterest;
      }
      if (item.CE_totalTradedVolume !== undefined) {
        totalCETotalTradedVolume += item.CE_totalTradedVolume;
      }
      if (item.PE_openInterest !== undefined) {
        totalPEOpenInterest += item.PE_openInterest;
      }
      if (item.PE_totalTradedVolume !== undefined) {
        totalPETotalTradedVolume += item.PE_totalTradedVolume;
      }
    });

    return {
      totalCEOpenInterest,
      totalCETotalTradedVolume,
      totalPEOpenInterest,
      totalPETotalTradedVolume,
    };
  };

  const totals: Totals = calculateTotals();

  const calculatePCRP = () => {
    const aggregatedPEValue = data.reduce((total, option) => {
      if (
        option.PE_openInterest !== undefined &&
        option.PE_lastPrice !== undefined
      ) {
        return total + option.PE_openInterest * option.PE_lastPrice;
      }
      return total;
    }, 0);
  
    const aggregatedCEValue = data.reduce((total, option) => {
      if (
        option.CE_openInterest !== undefined &&
        option.CE_lastPrice !== undefined &&
        option.CE_openInterest !== 0
      ) {
        return total + option.CE_openInterest * option.CE_lastPrice;
      }
      return total;
    }, 0);
  
    const pcrp = (aggregatedPEValue / aggregatedCEValue).toFixed(2);
    pcrpStore.setPCRP(pcrp); // Update the PCRP value in MobX store
  };
  
  React.useEffect(() => {
    calculatePCRP(); // Calculate and update PCRP when component mounts or data changes
  }, [data]);
  
  const calculatePCR = () => {
    const totals = calculateTotals();
    const putCallRatio =
    totals.totalCEOpenInterest !== 0
      ? (totals.totalPEOpenInterest / totals.totalCEOpenInterest).toFixed(2)
      : 0;
    pcrpStore.setPCR(putCallRatio); // Update the PCR value in MobX store 
    };

    React.useEffect(() => {
      calculatePCR(); // Calculate and update PCRP when component mounts or data changes
    }, [data]);
    console.log("PCR", pcrpStore.pcr);
  

  return (
    <div className={styles.table}>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Open Interest</th>
            <th>Total Traded Volume</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>CE</td>
            <td>{totals.totalCEOpenInterest}</td>
            <td>{totals.totalCETotalTradedVolume}</td>
          </tr>
          <tr>
            <td>PE</td>
            <td>{totals.totalPEOpenInterest}</td>
            <td>{totals.totalPETotalTradedVolume}</td>
          </tr>
        </tbody>
      </table>
      <TotalsCalculator data={data} />
    </div>
  );
};

export default TotalsCalculator;
