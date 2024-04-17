import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    // Fetch data from the API
    const response = await fetch('http://127.0.0.1:8000/api/script_master');
    const data = await response.json();
    //console.log('Script Master:', data);

    // Store the fetched data in the browser's local storage
    window.localStorage.setItem('scriptMaster', JSON.stringify(data));

    res.status(200).json({ message: 'Data fetched successfully and stored in local storage' });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: 'Error fetching data' });
  }
}
