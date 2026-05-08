// daily reminder via expo-notifications. fails silently if module missing

import { Platform } from 'react-native';

let mod = null;
function getMod() {
  if (mod) return mod;
  try { mod = require('expo-notifications'); } catch { mod = null; }
  return mod;
}

export async function requestNotificationPermission() {
  const m = getMod();
  if (!m) return false;
  const { status: existing } = await m.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await m.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDailyReminder(hour = 20, minute = 0) {
  const m = getMod();
  if (!m || !(await requestNotificationPermission())) return null;

  await cancelAllReminders();

  if (Platform.OS === 'android') {
    await m.setNotificationChannelAsync('daily-reminder', {
      name: 'Daily Reminder',
      importance: m.AndroidImportance?.DEFAULT,
    });
  }

  return m.scheduleNotificationAsync({
    content: { title: 'Nudge', body: "Don't forget to log your activities today! Keep your streak going." },
    trigger: { type: 'daily', hour, minute },
  });
}

export async function cancelAllReminders() {
  const m = getMod();
  if (m) await m.cancelAllScheduledNotificationsAsync();
}
