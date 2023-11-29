import React, { createContext, useContext, ReactNode } from 'react';
import { PaytmSocketStore, paytmSocketStore } from './PaytmSocketStore';

const StoreContext = createContext<PaytmSocketStore>(paytmSocketStore);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <StoreContext.Provider value={paytmSocketStore}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  console.log("In useStore",store);
  return store;
};



