import React, { useEffect } from 'react';

import type { AppProps } from 'next/app';
import { registerLicense } from '@syncfusion/ej2-base';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-buttons/styles/material.css';
import '@syncfusion/ej2-react-grids/styles/material.css';
import '../app/styles/globals.css';
import Navbar from '../app/components/NavBar/NavBar';
import { Provider } from 'mobx-react';

import { GoogleOAuthProvider } from '@react-oauth/google';
import StoreProvider from '../app/providers/StoreProvider';
import useRouter from 'next/router';
import { initializeStore } from '../stores/NseStore';

registerLicense('ORg4AjUWIQA/Gnt2V1hhQlJAfV5AQmBIYVp/TGpJfl96cVxMZVVBJAtUQF1hSn5Ud0VjWntYdXNQT2da');

function StockApp({ Component, pageProps }: AppProps) {
  const store = initializeStore(pageProps.initialState);

  useEffect(() => {
    if(pageProps.initialState) {
      store.setData(pageProps.initialState);
    }
  }, [pageProps.initialState]);

  return (
    <Provider store={store}>
      <GoogleOAuthProvider clientId="25803165890-sipf8cotdd2prj0afqu3gi1g9n8hote6.apps.googleusercontent.com">
        <StoreProvider>
          <Navbar />
          <Component {...pageProps} />
        </StoreProvider>
      </GoogleOAuthProvider>
    </Provider>
  );
}

export default StockApp;
