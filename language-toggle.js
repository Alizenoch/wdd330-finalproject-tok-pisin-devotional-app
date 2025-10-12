export function setupLanguageToggle(devotional, initialLang = 'tokPisin') {
  let isTokPisin = initialLang === 'tokPisin'; // ✅ Use stored preference if available

  function updateContent() {
    const titleEl = document.getElementById('title');
    const scriptureEl = document.getElementById('scripture');
    const devotionEl = document.getElementById('devotion');
    const toggleBtn = document.getElementById('toggleLang');
    const audioPlayer = document.getElementById('audioPlayer');

    if (titleEl && scriptureEl && devotionEl && toggleBtn && audioPlayer) {
      titleEl.textContent = isTokPisin
        ? devotional.title.tokPisin
        : devotional.title.english;

      scriptureEl.textContent = isTokPisin
        ? devotional.scripture.tokPisin
        : devotional.scripture.english;

      devotionEl.textContent = isTokPisin
        ? devotional.devotionalText.tokPisin
        : devotional.devotionalText.english;

      toggleBtn.textContent = isTokPisin
        ? 'Switch to English'
        : 'Switch to Tok Pisin';

      audioPlayer.src = isTokPisin
        ? devotional.audio.tokPisin
        : devotional.audio.english;

      audioPlayer.load(); // 🔄 Force reload of audio source
    } else {
      console.warn('One or more elements not found for language toggle.');
    }
  }

  document.getElementById('toggleLang')?.addEventListener('click', () => {
    isTokPisin = !isTokPisin;
    const currentLang = isTokPisin ? 'tokPisin' : 'english';
    localStorage.setItem('preferredLanguage', currentLang); // ✅ Save preference
    updateContent();
  });

  updateContent(); // Initial render
}

