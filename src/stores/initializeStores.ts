import { initializeStore } from './NseStore';
import { initializeNseFetchStore } from './NseFetchStore';
import { initializeDefaultStore } from './DefaultStore';
import { initializeExpiryDateStore } from './ExpiryDateStore';
import { NseOptionData, OptionData } from '@/types';

export const initializeStores = (initialData?: {
  oldData?: OptionData[];
  nseData?: NseOptionData[];
}) => {
  const defaultStore = initializeDefaultStore();
  const expiryDateStore = initializeExpiryDateStore();

  return {
    defaultStore,
    expiryDateStore,
    nseFetchStore: initializeStore(initialData?.oldData),
    anotherStore: initializeNseFetchStore(defaultStore, expiryDateStore, initialData?.nseData),
  };
};