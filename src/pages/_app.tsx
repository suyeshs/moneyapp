// pages/_app.tsx
import type { AppProps } from 'next/app';
import { registerLicense } from '@syncfusion/ej2-base';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-buttons/styles/material.css';
import '@syncfusion/ej2-react-grids/styles/material.css';
import { AuthProvider } from '../app/contexts/AuthContext';
import '../app/styles/globals.css';
import Navbar from "../app/components/NavBar/NavBar";


registerLicense('ORg4AjUWIQA/Gnt2VFhhQlJBfV5AQmBIYVp/TGpJfl96cVxMZVVBJAtUQF1hSn5Vdk1hWn1bcHxdR2ld');



function StockApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Navbar /> {/* Added this line */}
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default StockApp;
