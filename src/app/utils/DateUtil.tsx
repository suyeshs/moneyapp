// DateUtil.ts

export const convertToIST = (date: Date): Date => {
    const offsetToIST = 5.5 * 60 * 60000; // IST is UTC+5:30, converting hours to milliseconds
    const utcTime = date.getTime(); // Get the UTC time in milliseconds
    const istTime = utcTime + offsetToIST; // Add the offset to get IST time
    return new Date(istTime); // Return the IST time as a Date object
  };
  
  export const getISTStartDate = (startDate: Date): Date => {
    return convertToIST(startDate);
  };
  
  export const getISTEndDate = (endDate: Date): Date => {
    return convertToIST(endDate);
  };
  