import { setupLanguageToggle } from './language-toggle.js';
import { requestNotificationPermission, showDevotionalNotification } from './notifications.js';

// Register the service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log('✅ Service Worker registered'))
    .catch(err => console.error('❌ Service Worker registration failed:', err));
}

// Set today's date
document.getElementById("date").textContent = `Date: ${new Date().toDateString()}`;

// Ask for notification permission on load
requestNotificationPermission();

// Load devotional content
fetch('devotionals.json')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    const devotional = data[0]; // Load the first devotional

    // Populate content
    document.getElementById('title').textContent = devotional.title || 'Untitled';
    document.getElementById('scripture').textContent = devotional.scripture.text || '';
    document.getElementById('reference').textContent = devotional.scripture.reference
      ? `(${devotional.scripture.reference})`
      : '';
    document.getElementById('devotion').textContent = devotional.thought || '';
   

    // Initialize language toggle
    setupLanguageToggle(devotional);

    // Show push notification
    showDevotionalNotification("📖 Today's Devotional", devotional.title || "New devotional is available.");
  })
  .catch(error => {
    console.error('Error loading devotionals:', error);
    document.getElementById('devotion').textContent = 'Unable to load devotional content.';
  });

