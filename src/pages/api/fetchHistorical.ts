import { useState, useEffect } from 'react';

// Function to fetch chart data
const fetchChartData = async (startDate: string, endDate: string) => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/historical-data-view/start_date=${startDate}&end_date=${endDate}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

export default fetchChartData;
