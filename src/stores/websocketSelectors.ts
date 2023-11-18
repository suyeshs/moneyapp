// websocketSelectors.js

// Selector to get the underlyingValue from the websocket state
export const selectUnderlyingValue = (state) => {
    return state.websocket.data[0]?.underlyingValue;
  };
  