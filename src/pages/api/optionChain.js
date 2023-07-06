import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const response = await axios.get('https://www.nseindia.com/api/option-chain-indices?symbol=NIFTY', {
        headers: {
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "en-US,en;q=0.9,hi;q=0.8",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)"
        }
      });

      const data = response.data;
      
      const expiry_dates = data['records']['expiryDates'];
      const option_chain_data = data['records']['data'];

      console.log(expiry_dates);  // Print expiry dates to the terminal
      console.log(option_chain_data);  // Print option chain data to the terminal

      // Process the expiry dates and option chain data as required

      const result = {
        "expiry_dates": expiry_dates,
        "option_chain_data": option_chain_data
      };

      res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching option chain data:', error);  // Print the error to the terminal for debugging
      res.status(500).end();  // Return a 500 status code
    }
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
