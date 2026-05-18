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
  // 1. Anulăm toate alarmele vechi ca să nu primim duplicate dacă am modificat un task
  await Notifications.cancelAllScheduledNotificationsAsync();

  // 2. Dacă utilizatorul a oprit notificările din Setări, ne oprim aici
  if (!notificationsEnabled) return;

  const now = new Date();

  // 3. Trecem prin fiecare task și programăm o alarmă
  for (const task of tasks) {
    if (!task.estimated_transit_time || task.estimated_transit_time <= 0) continue;

    // Extragem anul, luna, ziua, ora și minutul din string-urile venite de la backend
    const [year, month, day] = task.date.split('-');
    const [hour, minute] = task.start_time.split(':');

    // Ora exactă la care începe task-ul
    const taskTime = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));

    // Scădem timpul de tranzit calculat de Google Maps
    const leaveTime = new Date(taskTime.getTime() - task.estimated_transit_time * 60000);

    // Setăm alerta cu 5 minute înainte să trebuiască să iasă pe ușă
    const alertTime = new Date(leaveTime.getTime() - 5 * 60000);

    // Programăm notificarea doar dacă ora de alertă este în viitor
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