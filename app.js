import { setupLanguageToggle } from './language-toggle.js';
import { requestNotificationPermission, showDevotionalNotification } from './notifications.js';

document.addEventListener('DOMContentLoaded', () => {
  requestNotificationPermission();

  let currentDate = new Date();

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

  function updateDateDisplay() {
    const dateEl = document.getElementById("date");
    if (dateEl) {
      dateEl.textContent = `Date: ${currentDate.toDateString()}`;
    }
  }

  function loadDevotional(date) {
    const dateStr = date.toISOString().split('T')[0];
    console.log('Requested date:', dateStr);

    fetch('devotionals.json')
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
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

  function fetchBoMVerse() {
    fetch('https://bomapi.vercel.app/api/v1/verse/daily')
      .then(response => response.json())
      .then(data => {
        const verseContainer = document.getElementById('bom-scripture');
        if (verseContainer && data && data.reference && data.text) {
          verseContainer.innerHTML = `
            <h3>📗 Book of Mormon Verse</h3>
            <p><strong>${data.reference}</strong>: ${data.text}</p>
          `;
        } else {
          throw new Error('Invalid BoM API response');
        }
      })
      .catch(error => {
        console.error('BoM API error:', error);
        const verseContainer = document.getElementById('bom-scripture');
        if (verseContainer) {
          verseContainer.innerHTML = `
            <h3>📗 Book of Mormon Verse</h3>
            <p>⚠️ Unable to load today’s verse. Please try again later.</p>
          `;
        }
      });
  }

  function fetchBibleVerse() {
    const bibleApiKey = '598d946e6da7af464fb35adb8ec94b'; // ✅ Active API key from API.Bible
    const bibleVersionId = 'de4e12af7f28f599-02'; // ESV version
    const verseId = 'MAT.17.20'; // Matthew 17:20

    fetch(`https://api.scripture.api.bible/v1/bibles/${bibleVersionId}/verses/${verseId}`, {
      headers: { 'api-key': bibleApiKey }
    })
      .then(response => response.json())
      .then(data => {
        const verseContainer = document.getElementById('bible-scripture');
        if (verseContainer) {
          verseContainer.innerHTML = `
            <h3>📘 Bible Verse (English)</h3>
            <p>${data.data.content}</p>
          `;
        }
      })
      .catch(error => {
        console.error('Bible API error:', error);
        const verseContainer = document.getElementById('bible-scripture');
        if (verseContainer) {
          verseContainer.innerHTML = `
            <h3>📘 Bible Verse (English)</h3>
            <p>⚠️ Unable to load Bible verse. Please try again later.</p>
          `;
        }
      });
  }

  function navigateDevotional(direction) {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction);
    currentDate = newDate;
    updateDateDisplay();
    loadDevotional(currentDate);
  }

  document.getElementById('prevBtn')?.addEventListener('click', () => navigateDevotional(-1));
  document.getElementById('nextBtn')?.addEventListener('click', () => navigateDevotional(1));

  updateDateDisplay();
  loadDevotional(currentDate);
  fetchBoMVerse();
  fetchBibleVerse();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
      .then(() => console.log('✅ Service Worker registered'))
      .catch(err => console.error('❌ Service Worker registration failed:', err));
  }
});
