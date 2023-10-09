import React from 'react';
import { initializeStores } from './initializeStores';
import { NseOptionData, OptionData } from '@/types';

// Initialize your stores here
const initialData: { oldData?: OptionData[]; nseData?: NseOptionData[] } = {
  oldData: [],
  nseData: [],
};
const stores = initializeStores(initialData);

export const storesContext = React.createContext(stores);

export const useStores = () => React.useContext(storesContext);