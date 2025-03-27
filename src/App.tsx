import React, { useEffect } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/store';
import { setupOfflineSync } from './redux/middleware/offlineMiddleware';
import AppNavigator from './navigation/AppNavigator';
import OfflineIndicator from './components/OfflineIndicator';

// Suppress specific warnings
LogBox.ignoreLogs([
  'VirtualizedLists should never be nested', // Ignore this warning as we sometimes need nested scroll views
  'Possible Unhandled Promise Rejection', // We handle promise rejections in our redux slices
]);

const App = () => {
  useEffect(() => {
    // Setup offline synchronization
    setupOfflineSync(store);
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <AppNavigator />
            <OfflineIndicator />
          </SafeAreaView>
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default App;