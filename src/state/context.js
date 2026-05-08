// react context: gives every screen access to state and setState

import React from 'react';

export const AppContext = React.createContext({
  booted: false,
  state: null,
  setState: async () => {},
});
