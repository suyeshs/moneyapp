// initializeExpiryDateStore.ts
import { makeObservable, observable, action } from 'mobx';
import { ExpiryDateStore } from './ExpiryDateStore';

export const initializeExpiryDateStore = () => {
    const expiryDateStore = new ExpiryDateStore();
    makeObservable(expiryDateStore, {
        // Add observable, action, and other annotations here
    });
    return expiryDateStore;
};
