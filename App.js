// IMPORT PACKAGES
import 'react-native-gesture-handler';
import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';

// IMPORT NAVIGATION
import Navigator from './src/navigation/Navigator';

// import { ReadValue } from './src/actions';

const App = () => {
  return (
    <NavigationContainer>
      <Navigator />
    </NavigationContainer>
  );
};

export default App;
