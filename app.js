import { setupLanguageToggle } from './language-toggle.js';
import { requestNotificationPermission, showDevotionalNotification } from './notifications.js';

// Register the service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log('✅ Service Worker registered'))
    .catch(err => console.error('❌ Service Worker registration failed:', err));
}

// Ask for notification permission on load
requestNotificationPermission();

// Track current date
let currentDate = new Date();

// Fallback devotional for offline or missing dates
const fallbackDevotional = {
  date: 'fallback',
  title: {
    tokPisin: 'Tok Bilong Strongim Bel',
    english: 'Words of Encouragement'
  },
  scripture: {
    tokPisin: 'God bai i stap wantaim yu long olgeta taim.',
    english: 'God will be with you always.',
    reference: 'Joshua 1:9'
  },
  devotionalText: {
    tokPisin: 'No ken pret. God i stap wantaim yu.',
    english: 'Do not fear. God is with you.'
  },
  audio: {
    tokPisin: 'audio/fallback_tokPisin.mp3',
    english: 'audio/fallback_english.mp3'
  }
};

// Display date
function updateDateDisplay() {
  document.getElementById("date").textContent = `Date: ${currentDate.toDateString()}`;
}

// Load devotional for a given date
function loadDevotional(date) {
  const dateStr = date.toISOString().split('T')[0];
  console.log('Requested date:', dateStr);

  fetch('devotionals.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      const devotional = data.find(entry => entry.date === dateStr) || fallbackDevotional;

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

        if (devotional.date === 'fallback') {
          devotionEl.textContent += '\n⚠️ Showing fallback devotional due to missing or offline data.';
        }
      }

      setupLanguageToggle(devotional);
      showDevotionalNotification("📖 Today's Devotional", devotional.title.english || "New devotional is available.");
    })
    .catch(error => {
      console.error('Error loading devotionals:', error);
      const devotionEl = document.getElementById('devotion');
      const audioPlayer = document.getElementById('audioPlayer');

      if (devotionEl && audioPlayer) {
        devotionEl.textContent = fallbackDevotional.devotionalText.tokPisin +
          '\n⚠️ Showing fallback devotional due to network error.';
        audioPlayer.src = fallbackDevotional.audio.tokPisin;
      }

      setupLanguageToggle(fallbackDevotional);
    });
}

// Navigation logic
function navigateDevotional(direction) {
  currentDate.setDate(currentDate.getDate() + direction);
  updateDateDisplay();
  loadDevotional(currentDate);
}

// Wire up buttons
document.getElementById('prevBtn').addEventListener('click', () => navigateDevotional(-1));
document.getElementById('nextBtn').addEventListener('click', () => navigateDevotional(1));

// Initial load
updateDateDisplay();
loadDevotional(currentDate);
