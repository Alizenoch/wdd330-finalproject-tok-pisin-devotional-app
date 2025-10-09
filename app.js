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
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const devotional = data.find(entry => entry.date === today) || data[0]; // Fallback to first if not found

    // Confirm structure before rendering
    if (
      devotional &&
      devotional.title &&
      devotional.scripture &&
      devotional.devotionalText &&
      devotional.audio
    ) {
      // Populate initial Tok Pisin content
      const titleEl = document.getElementById('title');
      const scriptureEl = document.getElementById('scripture');
      const referenceEl = document.getElementById('reference');
      const devotionEl = document.getElementById('devotion');
      const audioPlayer = document.getElementById('audioPlayer');

      if (titleEl && scriptureEl && referenceEl && devotionEl && audioPlayer) {
        titleEl.textContent = devotional.title.tokPisin || 'Untitled';
        scriptureEl.textContent = devotional.scripture.tokPisin || '';
        referenceEl.textContent = devotional.scripture.reference
          ? `(${devotional.scripture.reference})`
          : '';
        devotionEl.textContent = devotional.devotionalText.tokPisin || '';
        audioPlayer.src = devotional.audio.tokPisin || '';
      }

      // Initialize language toggle
      setupLanguageToggle(devotional);

      // Show push notification
      showDevotionalNotification("📖 Today's Devotional", devotional.title.english || "New devotional is available.");
    } else {
      console.warn('Devotional structure is incomplete.');
      document.getElementById('devotion').textContent = 'Devotional data is missing or incomplete.';
    }
  })
  .catch(error => {
    console.error('Error loading devotionals:', error);
    document.getElementById('devotion').textContent = 'Unable to load devotional content.';
  });
