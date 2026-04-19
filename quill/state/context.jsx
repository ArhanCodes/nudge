
import React from 'react';
import { StyleSheet } from 'react-native';

export const AppContext = React.createContext({ booted: false, state: null, setState: () => null });