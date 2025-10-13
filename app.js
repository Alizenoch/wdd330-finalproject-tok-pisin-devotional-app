import { setupLanguageToggle } from './language-toggle.js';
import { requestNotificationPermission, showDevotionalNotification } from './notifications.js';

document.addEventListener('DOMContentLoaded', () => {
  requestNotificationPermission();

  // 🔄 Retrieve last viewed date or default to today
  const savedDate = localStorage.getItem('lastDevotionalDate');
  let currentDate = savedDate ? new Date(savedDate) : new Date();

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

  function updateFlipCard(devotional) {
    const frontEl = document.querySelector('.card-front p');
    const backEl = document.querySelector('.card-back p');

    if (frontEl && backEl) {
      frontEl.textContent = devotional.scripture.tokPisin || '';
      backEl.textContent = devotional.devotionalText.tokPisin || '';
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

        updateFlipCard(devotional);

        // ✅ Save last viewed date
        localStorage.setItem('lastDevotionalDate', dateStr);

        // 🔄 Retrieve preferred language
        const savedLang = localStorage.getItem('preferredLanguage');
        console.log('Applying devotional in:', savedLang || 'tokPisin');
        if (savedLang) {
          setupLanguageToggle(devotional, savedLang);
        } else {
          setupLanguageToggle(devotional);
        }

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

        updateFlipCard(fallbackDevotional);

        const savedLang = localStorage.getItem('preferredLanguage');
        if (savedLang) {
          setupLanguageToggle(fallbackDevotional, savedLang);
        } else {
          setupLanguageToggle(fallbackDevotional);
        }
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
    const bibleApiKey = '598d946e6da7af464fb35adb8ec94b';
    const bibleVersionId = 'de4e12af7f28f599-02';
    const verseId = 'MAT.17.20';

    fetch(`https://api.scripture.api.bible/v1/bibles/${bibleVersionId}/verses/${verseId}`, {
      headers: { 'api-key': bibleApiKey }
    })
      .then(response => response.json())
      .then(data => {
        const spinner = document.getElementById('spinner');
        const verseText = document.getElementById('verse-text');

        if (spinner && verseText) {
          spinner.style.display = 'none';
          verseText.textContent = data.data.content;
          verseText.classList.remove('hidden');
          verseText.classList.add('visible');
        }
      })
      .catch(error => {
        console.error('Bible API error:', error);
        const spinner = document.getElementById('spinner');
        const verseText = document.getElementById('verse-text');

        if (spinner && verseText) {
          spinner.style.display = 'none';
          verseText.textContent = '⚠️ Unable to load Bible verse. Please try again later.';
          verseText.classList.remove('hidden');
          verseText.classList.add('visible');
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

  // 🔄 Share method tracking
  const lastMethod = localStorage.getItem('lastShareMethod');
  if (lastMethod) {
    const btn = document.getElementById(`${lastMethod.toLowerCase()}Btn`);
    if (btn) {
      btn.style.border = '2px solid #4CAF50';
      btn.title = `Last shared via ${lastMethod}`;
    }
  }

  document.getElementById('whatsappBtn')?.addEventListener('click', () => {
    localStorage.setItem('lastShareMethod', 'WhatsApp');
  });

  document.getElementById('smsBtn')?.addEventListener('click', () => {
    localStorage.setItem('lastShareMethod', 'SMS');
  });

  document.getElementById('facebookBtn')?.addEventListener('click', () => {
    localStorage.setItem('lastShareMethod', 'Facebook');
  });

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
