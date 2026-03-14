import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from './supabase';

/**
 * Configurar comportamiento de notificaciones
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Solicita permisos y registra token de notificaciones
 */
export async function registerForPushNotifications(userId: string) {
  if (!Device.isDevice) {
    console.log('Push notifications only work on physical devices');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return null;
  }

  try {
    // Obtener token de Expo
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID || 'your-project-id',
    });
    const token = tokenData.data;

    // Guardar en Supabase
    await supabase
      .from('profiles')
      .update({ push_token: token })
      .eq('id', userId);

    // Configuración Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6C63FF',
      });
    }

    return token;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
}

/**
 * Envía notificación push a un usuario
 * NOTA: Esto debe llamarse desde el backend (Edge Functions)
 */
export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data?: any
) {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('push_token')
      .eq('id', userId)
      .single();

    if (!profile?.push_token) {
      console.log('User has no push token');
      return;
    }

    const message = {
      to: profile.push_token,
      sound: 'default',
      title,
      body,
      data: data || {},
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}

/**
 * Programa notificación local (para alertas de vencimiento)
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  triggerDate: Date,
  data?: any
) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        data: data || {},
      },
      trigger: triggerDate,
    });
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
}

/**
 * Cancela todas las notificaciones programadas
 */
export async function cancelAllScheduledNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Obtiene todas las notificaciones programadas
 */
export async function getScheduledNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}
