// hooks/useSymbolData.ts

import { useEffect } from 'react';

const useSymbolData = () => {
  useEffect(() => {
    const fetchSymbols = async () => {
      if (!localStorage.getItem('symbols')) {
        try {
          const response = await fetch('http://127.0.0.1:8000/api/symbols');
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          console.log('data:', data);
          const symbols = data.map((item: any) => item.symbol);
          localStorage.setItem('symbols', JSON.stringify(symbols));
        } catch (error) {
          console.error('Error fetching symbols:', error);
        }
      }
    };

    fetchSymbols();
  }, []);
};

export default useSymbolData;
