import fetch from 'node-fetch'; // Import node-fetch
import { PaytmSocketStore } from '../../stores/PaytmSocketStore'; // Import the Paytm store

export const getScriptMaster = async () => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/script-master');

    // Check if the HTTP status code is successful
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Log the error to the console for debugging
    console.error('Failed to fetch script master data:', error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};

export const fetchLastStrike = async (symbol: string, expiry: string, paytmSocketStore: PaytmSocketStore): Promise<void> => {
  // Check if symbol and expiry are provided
  if (!symbol || !expiry) {
    console.error('Symbol and expiry_date are required parameters.');
    throw new Error('Symbol and expiry_date are required parameters.');
  }

  try {
    const response = await fetch(`http://127.0.0.1:8000/api/last-strike/?symbol=${symbol}&expiry_date=${expiry}`);
    const data = await response.json();
    console.log('Last Strike API:', data);
    // Assuming the dynamic value is present in the 'data' object with the key 'lastStrikePrice'
    const lastStrikePrice = data;

    // Set the last strike price directly in the Paytm store
    if (lastStrikePrice !== null) {
      paytmSocketStore.setLastStrike(lastStrikePrice);
    } else {
      console.error('Error fetching last strike price');
    }
  } catch (error) {
    console.error('Error fetching dynamic value:', error);
  }
};
