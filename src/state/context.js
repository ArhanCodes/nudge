import React from 'react';

export const AppContext = React.createContext({
  booted: false,
  state: null,
  setState: async () => {},
});
