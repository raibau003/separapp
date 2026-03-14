import { GoogleSignin } from '@react-native-google-signin/google-signin';

/**
 * Configuración de Google Sign-In
 * NOTA: El webClientId se debe obtener de Firebase Console
 * Project Settings > General > Web API Key
 */
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
  offlineAccess: true,
});

export { GoogleSignin };

/**
 * Firebase se configurará con React Native Firebase en el futuro
 * Por ahora exportamos GoogleSignin para comenzar con autenticación de Google
 */
export const initializeFirebase = () => {
  console.log('Firebase initialized');
};
