// notifications.js

export function requestNotificationPermission() {
  if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        console.log('Notification permission granted.');
      } else {
        console.warn('Notification permission denied.');
      }
    });
  }
}

export function showDevotionalNotification(title, message) {
  if (Notification.permission === 'granted') {
    navigator.serviceWorker.getRegistration().then(reg => {
      if (reg) {
        reg.showNotification(title, {
          body: message,
          icon: 'images/devotional-icon.png',
          tag: 'daily-devotional',
          renotify: true
        });
      }
    });
  }
}
