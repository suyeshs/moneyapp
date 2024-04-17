import React, { useEffect, useMemo } from 'react';

import type { AppProps } from 'next/app';
import { registerLicense } from '@syncfusion/ej2-base';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-buttons/styles/material.css';
import '@syncfusion/ej2-react-grids/styles/material.css';
import '../app/styles/globals.css';
import Navbar from '../app/components/NavBar/NavBar';
//import { Provider } from 'mobx-react';
import { Provider } from 'react-redux';
import { store } from '../stores/store';
import '../app/styles/fluent.css';
import { configure } from 'mobx';

//import { GoogleOAuthProvider } from '@react-oauth/google';
//import { initializeStores } from '../stores/initializeStores'; // Importing from the current directory


registerLicense('ORg4AjUWIQA/Gnt2V1hhQlJAfV5AQmBIYVp/TGpJfl96cVxMZVVBJAtUQF1hSn5Ud0VjWntYdXNQT2da');

// Adjust the reaction limit
configure({
  reactionScheduler: (...args) => {
    // Custom reaction scheduler logic if needed
    return setTimeout(...args); // Example: using setTimeout
  },
  
  enforceActions: "observed", // Enforce strict actions (default: "never")
  computedRequiresReaction: true, // Enable computed requires reaction (default: true)
  disableErrorBoundaries: false, // Disable error boundaries (default: false)
  isolateGlobalState: false, // Isolate global state (default: false)
  // Set the reaction limit (default: 1000)
});

function StockApp({ Component, pageProps }: AppProps) {
  //const stores = useMemo(() => initializeStores(pageProps.initialState), [pageProps.initialState]);

  // If you need to use specific stores in this file, you can also destructure them here:
  // const { nseFetchStore, nseStore } = stores;

  useEffect(() => {
    // You can use specific stores as needed in this effect
  }, [pageProps.initialState]);

  return (
    <Provider store={store}> {/* Spreading the stores object */}
     
          <Navbar />
          <Component {...pageProps} />
      
      
    </Provider>
  );
}

export default StockApp;
