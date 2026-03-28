import { Platform } from 'react-native';

// GoogleSignin solo en plataformas nativas
let GoogleSignin: any = null;

if (Platform.OS !== 'web') {
  try {
    const { GoogleSignin: RNGoogleSignin } = require('@react-native-google-signin/google-signin');
    GoogleSignin = RNGoogleSignin;
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
      offlineAccess: true,
    });
  } catch (error) {
    console.warn('GoogleSignin not available');
  }
}

export { GoogleSignin };

/**
 * Firebase se configurará con React Native Firebase en el futuro
 * Por ahora exportamos GoogleSignin para comenzar con autenticación de Google
 */
export const initializeFirebase = () => {
  console.log('Firebase initialized');
};
