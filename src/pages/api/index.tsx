import React, { useEffect } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { NseDataStore } from '../../stores/NseNewStore';

interface NseDataFetcherProps {
    nseDataStore: NseDataStore;
  }

const fetcher = (url: string) => axios.get(url).then(res => res.data);
const url = `https://tradepodapisrv.azurewebsites.net/api/option-chain-copy/?symbol=NIFTY&expiry_date=21-Sept-2023`;
const NseDataFetcher = ({ nseDataStore }: NseDataFetcherProps) => {

  const { data, error } = useSWR('/api/data', fetcher);

  useEffect(() => {
    if (data) {
      nseDataStore.setData(data);
      console.log(data); // This will log the data to the console
    }
  }, [data]);

  // Render your component based on the data in the store
  // ...
};

export default NseDataFetcher;