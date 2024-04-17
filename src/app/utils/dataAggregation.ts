import { fetchHistoricalData } from '../../app/lib/mongodb';

export interface ChartData {
    openInterest: number | string;
    strikePrice: number | string;
    ltp: number | string;
    date: string;
 
    optionType: string;
}

export interface AggregatedData {
    strikePrice: number;
    averagePrice: number;
    totalVolume: number;
    date: string;
    optionType: string;
    pcpr: string;
    pcr: string;

}

export const aggregateDailyData = (
  records: ChartData[],
  startDate: Date,
  endDate: Date
): AggregatedData[] => {
  const dailyData: {
    [key: string]: { volume: number; priceTotal: number; count: number; optionType: string };
  } = {};

  // Initialize an object to hold the running totals and counts
const aggregates = {
  CE: { total: 0, count: 0 },
  PE: { total: 0, count: 0 },
  Unknown: { total: 0, count: 0 }
};

// Iterate over your records
for (const record of records) {
  // Determine the optionType as before
  const optionType = record.optionType === 'CE' || record.optionType === 'PE' ? record.optionType : 'Unknown';

  // Update the running total and count for the determined optionType
  aggregates[optionType].total += Number (record.openInterest);
  aggregates[optionType].count += 1;
}

// Calculate the averages
const averages = {
  CE: aggregates.CE.count > 0 ? aggregates.CE.total / aggregates.CE.count : 0,
  PE: aggregates.PE.count > 0 ? aggregates.PE.total / aggregates.PE.count : 0,
  Unknown: aggregates.Unknown.count > 0 ? aggregates.Unknown.total / aggregates.Unknown.count : 0
};

  records.forEach((record) => {
    const dateObject = new Date(record.date);

    if (dateObject < startDate || dateObject > endDate) {
      return;
    }
    const optionType = record.optionType === 'CE' || record.optionType === 'PE' ? record.optionType : 'Unknown';
    const day = dateObject.toISOString().split('T')[0];
    const strikePriceKey = typeof record.strikePrice === 'string' ? parseInt(record.strikePrice) : record.strikePrice;
    const key = `${day}_${strikePriceKey}_${optionType}`;

    if (!dailyData[key]) {
      dailyData[key] = { volume: 0, priceTotal: 0, count: 0, optionType };
    }

    const openInterestTotal = typeof record.openInterest === 'string' ? parseFloat(record.openInterest.replace(/-/g, '0')) : record.openInterest;
    const ltpValue = typeof record.ltp === 'string' ? parseFloat(record.ltp.replace(/-/g, '0')) : record.ltp;

    dailyData[key].volume += isNaN(openInterestTotal) ? 0 : openInterestTotal;
    dailyData[key].priceTotal += isNaN(ltpValue) ? 0 : ltpValue;
    dailyData[key].count += 1;
  });

  return Object.entries(dailyData).map(([key, data]) => {
    const [date, strikePrice, optionType] = key.split('_');
    const averagePrice = data.count > 0 ? parseFloat((data.priceTotal / data.count).toFixed(2)) : 0;
    
    let ceValue = 0;
    let peValue = 0;
    const ceData = dailyData[`${date}_${strikePrice}_CE`];
    const peData = dailyData[`${date}_${strikePrice}_PE`];

    const ceAveragePrice = ceData.count > 0 ? ceData.priceTotal / ceData.count : 0;
    const peAveragePrice = peData.count > 0 ? peData.priceTotal / peData.count : 0;
    //console.log('CE Average Price:', ceAveragePrice);
    ceValue = ceData.volume * ceAveragePrice;
    peValue = peData.volume * peAveragePrice;
    const pcpr = (peValue / ceValue).toFixed(2);
    const pcr = (peData.volume / ceData.volume).toFixed(2);
    //console.log ('PCR:', pcr);
    //console.log('CE:', ceValue, 'PE:', peValue,'Ratio:',pcpr);
    if (data.optionType === 'CE' && data.volume > 0 && averagePrice > 0) {
      
      if (ceData && ceData.volume > 0) {
        console.log('CE OI:', ceData.volume);
        ceValue = ceData.volume * ceAveragePrice;
      }
      //console.log('CE:', ceValue);
      //console.log('Strike:', strikePrice);
    }
    
  
    if (data.optionType === 'PE' && data.volume > 0 && averagePrice > 0) {
      if (peData && peData.volume > 0) {
        peValue = peData.volume * peAveragePrice;
       // console.log('Strike:', strikePrice);
      }
      
     

    }

    

    return {
      date,
      strikePrice: parseInt(strikePrice),
      averagePrice,
      totalVolume: data.volume,
      optionType,
      pcpr,
      pcr
      
    };
  });
};



  
  
