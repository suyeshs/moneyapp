import React, { useEffect } from "react";
import { autorun } from "mobx";
import { paytmSocketStore } from "../../../stores/PaytmSocketStore";
import { useWebSocketMobX } from "../../../hooks/useSocketMobx";

const WebSocketConnector = () => {
  const { connectWebSocket } = useWebSocketMobX();

  useEffect(() => {
    // Create an autorun to call connectWebSocket when selectedSymbol or selectedExpiry changes
    const autorunDisposer = autorun(() => {
      const { selectedSymbol, selectedExpiry } = paytmSocketStore;
      if (selectedSymbol && selectedExpiry) {
        connectWebSocket();
      }
    });

    // Clean up the autorun when the component unmounts
    return autorunDisposer;
  }, [connectWebSocket]); // Re-run effect when connectWebSocket changes

  // This component doesn't need to render anything in the UI
  return null;
};

export default WebSocketConnector;
