// utils/index.ts

export const getStartEndDate = (startDateParam: string, endDateParam: string) => {
    // Default values for start and end dates
    const defaultStartDate = new Date("2023-10-06T00:00:00.000");
    const defaultEndDate = new Date("2024-02-10T00:00:00.000");

    // Parse start and end dates from query parameters or use default values
    const startDate = startDateParam ? new Date(startDateParam) : defaultStartDate;
    const endDate = endDateParam ? new Date(endDateParam) : defaultEndDate;

    // Adjust dates to IST (Indian Standard Time)
    const offsetToIST = 5.5 * 60 * 60000; // Convert 5.5 hours to milliseconds
    const convertToIST = (date: Date) => new Date(date.getTime() + offsetToIST);

    return {
        startDate: convertToIST(startDate),
        endDate: convertToIST(endDate),
    };
};
