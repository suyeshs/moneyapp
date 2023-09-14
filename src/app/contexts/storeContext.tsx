// storeContext.ts
import { createContext } from 'react';
import { NseFetchStore } from '../../stores/NseFetchStore'; // Update the path accordingly

const store = new NseFetchStore();
export const StoreContext = createContext(store);
