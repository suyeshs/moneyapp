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

}

export const aggregateDailyData = (
    records: ChartData[],
    startDate: Date,
    endDate: Date
): AggregatedData[] => {
    const dailyData: { [key: string]: { volume: number; priceTotal: number; count: number, optionType: string } } = {};

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

        const openInterestValue = typeof record.openInterest === 'string' ? parseFloat(record.openInterest.replace(/-/g, '0')) : record.openInterest;
        const ltpValue = typeof record.ltp === 'string' ? parseFloat(record.ltp.replace(/-/g, '0')) : record.ltp;

        dailyData[key].volume += isNaN(openInterestValue) ? 0 : openInterestValue;
        dailyData[key].priceTotal += isNaN(ltpValue) ? 0 : ltpValue;
        dailyData[key].count += 1;
    });

    return Object.entries(dailyData).map(([key, data]) => {
        const [date, strikePrice] = key.split('_');
        const averagePrice = data.count > 0 ? parseFloat((data.priceTotal / data.count).toFixed(2)) : 0;
        console.log("Average Price",averagePrice)

        return {
            date,
            strikePrice: parseInt(strikePrice),
            averagePrice,
            totalVolume: data.volume,
            optionType: data.optionType,

        };
    });
};
