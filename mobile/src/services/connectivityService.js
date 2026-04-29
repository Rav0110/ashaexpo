import NetInfo from '@react-native-community/netinfo';

let _isConnected = false;
let _listeners = [];

/**
 * Start listening for connectivity changes.
 */
export function startConnectivityListener() {
  return NetInfo.addEventListener(state => {
    const connected = !!(state.isConnected && state.isInternetReachable);
    const wasOffline = !_isConnected;
    _isConnected = connected;

    // Notify all registered listeners
    _listeners.forEach(cb => cb(connected, wasOffline && connected));
  });
}

/**
 * Check current connectivity (cached).
 */
export function isOnline() {
  return _isConnected;
}

/**
 * Fetch current connectivity (fresh check).
 */
export async function checkConnectivity() {
  const state = await NetInfo.fetch();
  _isConnected = !!(state.isConnected && state.isInternetReachable);
  return _isConnected;
}

/**
 * Register a callback for connectivity changes.
 * @param {function} callback - (isConnected, justReconnected) => void
 */
export function onConnectivityChange(callback) {
  _listeners.push(callback);
  return () => {
    _listeners = _listeners.filter(cb => cb !== callback);
  };
}
