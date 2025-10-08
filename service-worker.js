// service-worker.js

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('index.html') // Or your hosted URL
  );
});
