import React from 'react';
import type { AppProps } from 'next/app';
import { registerLicense } from '@syncfusion/ej2-base';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-buttons/styles/material.css';
import '@syncfusion/ej2-react-grids/styles/material.css';
import '../app/styles/globals.css';
import Navbar from '../app/components/NavBar/NavBar';
import { Provider } from 'mobx-react';
import { optionStore } from '../stores/OptionStore';
import { GoogleOAuthProvider } from '@react-oauth/google';
import StoreProvider from '../app/providers/StoreProvider';
import { useRouter } from 'next/router';

registerLicense('ORg4AjUWIQA/Gnt2VFhhQlJBfV5AQmBIYVp/TGpJfl96cVxMZVVBJAtUQF1hSn5Vdk1hWn1bcHxdR2ld');

function StockApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <Provider optionStore={optionStore}>
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
