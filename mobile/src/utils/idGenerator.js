/**
 * Generate a unique ID without relying on external uuid library 
 * (which requires crypto polyfills in React Native).
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}
