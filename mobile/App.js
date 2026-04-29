// URL polyfill MUST be the first import — Hermes hoists imports in order
import './src/polyfills';

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { getDatabase } from './src/database/db';
import { startConnectivityListener } from './src/services/connectivityService';
import { initSyncManager } from './src/services/syncManager';

export default function App() {
  useEffect(() => {
    // Initialize SQLite database and tables on app launch
    getDatabase().then(() => {
      console.log('SQLite database initialized');
    }).catch(err => {
      console.error('DB init failed:', err);
    });

    // Start connectivity listener
    const unsubscribe = startConnectivityListener();

    // Initialize sync manager (auto-sync on reconnect)
    initSyncManager();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
