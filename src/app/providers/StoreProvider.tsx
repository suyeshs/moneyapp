import React, { ReactNode } from 'react';
import { Provider } from 'mobx-react';
import { optionStore } from '@/stores/OptionStore';

interface StoreProviderProps {
  children: ReactNode;
}

export const rootStore = {
  optionStore: optionStore,
};

export const StoreContext = React.createContext(rootStore);

export const useStore = () => React.useContext(StoreContext);

const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  return (
    <Provider {...rootStore}>
      <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>
    </Provider>
  );
};

export default StoreProvider;
