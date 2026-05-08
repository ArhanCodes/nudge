// React Context that exposes the app's state and a setState function to every
// screen, so we don't have to thread props through every component.

import React from 'react';

export const AppContext = React.createContext({
  booted: false,
  state: null,
  setState: async () => {}
});