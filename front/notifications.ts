import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Task } from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
      shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions() {
  if (!Device.isDevice) {
    console.log('Notificările Push funcționează doar pe un telefon fizic.');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Permisiunea pentru notificări a fost respinsă.');
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4338ca',
    });
  }

  return true;
}

export async function scheduleTransitNotifications(tasks: Task[], notificationsEnabled: boolean) {

  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!notificationsEnabled) return;

  const now = new Date();

  for (const task of tasks) {
    if (!task.estimated_transit_time || task.estimated_transit_time <= 0) continue;

    const [year, month, day] = task.date.split('-');
    const [hour, minute] = task.start_time.split(':');

    const taskTime = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));

    const leaveTime = new Date(taskTime.getTime() - task.estimated_transit_time * 60000);

    const alertTime = new Date(leaveTime.getTime() - 5 * 60000);

    if (alertTime > now) {
     await Notifications.scheduleNotificationAsync({
        content: {
          title: `🚗 Get ready to leave!`,
          body: `You need to leave for "${task.title}" in 5 minutes. Transit takes ~${task.estimated_transit_time} minutes.`,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: alertTime,
          channelId: 'default',
        },
      });
      console.log(`Notificare programată pentru ${task.title} la ora ${alertTime.toLocaleTimeString()}`);
    }
  }
}