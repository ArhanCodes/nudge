import { Platform } from 'react-native';

let Notifications = null;

async function getNotificationsModule() {
  if (Notifications) return Notifications;
  try {
    Notifications = require('expo-notifications');
    return Notifications;
  } catch {
    return null;
  }
}

export async function requestNotificationPermission() {
  const mod = await getNotificationsModule();
  if (!mod) return false;

  const { status: existing } = await mod.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await mod.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDailyReminder(hour = 20, minute = 0) {
  const mod = await getNotificationsModule();
  if (!mod) return null;

  const granted = await requestNotificationPermission();
  if (!granted) return null;

  // Cancel any existing reminders first
  await cancelAllReminders();

  if (Platform.OS === 'android') {
    await mod.setNotificationChannelAsync('daily-reminder', {
      name: 'Daily Reminder',
      importance: mod.AndroidImportance?.DEFAULT,
    });
  }

  const id = await mod.scheduleNotificationAsync({
    content: {
      title: 'Nudge',
      body: "Don't forget to log your activities today! Keep your streak going.",
    },
    trigger: {
      type: 'daily',
      hour,
      minute,
    },
  });

  return id;
}

export async function cancelAllReminders() {
  const mod = await getNotificationsModule();
  if (!mod) return;
  await mod.cancelAllScheduledNotificationsAsync();
}
