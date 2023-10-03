// TradingViewWidget.tsx

import React, { useEffect, useRef } from 'react';

interface TradingViewWidgetProps {
  // You can expand this interface to include the type of properties your TradingView widget might accept
  symbol: string;
  interval: string;
  timezone: string;
  theme: string;
  style: string;
  locale: string;
  enable_publishing: boolean;
  backgroundColor: string;
  allow_symbol_change: boolean;
  container_id: string;
}

declare global {
  interface Window {
    TradingView: any;
  }
}

let tvScriptLoadingPromise: Promise<void> | null = null;

const TradingViewWidget: React.FC<TradingViewWidgetProps> = () => {
    const onLoadScriptRef = useRef<(() => void) | null>(null) as React.MutableRefObject<(() => void) | null>;
    
  useEffect(() => {
    (onLoadScriptRef.current as () => void) = createWidget;

    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement('script');
        script.id = 'tradingview-widget-loading-script';
        script.src = 'https://s3.tradingview.com/tv.js';
        script.type = 'text/javascript';
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    }

    tvScriptLoadingPromise.then(() => onLoadScriptRef.current && onLoadScriptRef.current());

    return () => { onLoadScriptRef.current = null };

    function createWidget() {
      const element = document.getElementById('tradingview_fad22');
      if (element && window.TradingView) {
        new window.TradingView.widget({
            width: 980,
            height: 610,
          symbol: "EUREX:AAPH1!",
          interval: "D",
          timezone: "Asia/Kolkata",
          theme: "light",
          style: "1",
          locale: "en",
          enable_publishing: false,
          backgroundColor: "rgba(208, 224, 227, 1)",
          allow_symbol_change: true,
          container_id: "tradingview_fad22"
        });
      }
    }
  }, []);

  return (
    <div className='tradingview-widget-container' style={{ width: '100vw', height: '100vh' }}>
      <div id='tradingview_fad22' />
      <div className="tradingview-widget-copyright">
        <a href="https://www.tradepod.com" rel="noopener noreferrer" target="_blank"><span className="blue-text">Track all markets on TradingView</span></a>
      </div>
    </div>
  );
}

export default TradingViewWidget;
