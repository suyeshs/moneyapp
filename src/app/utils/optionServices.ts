import fetch from 'node-fetch'; // Import node-fetch

export const getOptionsChain = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/iv?symbol=NIFTY&expiry_date=23-11-2023');
  
      // Check if the HTTP status code is successful
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log(data)
      return data;
    } catch (error) {
      // Log the error to the console for debugging
      console.error('Failed to fetch script master data:', error);
      throw error; // Re-throw the error to handle it in the calling function
    }
  };