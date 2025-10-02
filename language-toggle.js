export function setupLanguageToggle(devotional) {
  let isTokPisin = true;

  function updateContent() {
    document.getElementById('scripture').textContent = isTokPisin
      ? devotional.scripture.tokPisin
      : devotional.scripture.english;

    document.getElementById('devotion').textContent = isTokPisin
      ? devotional.devotionalText
      : devotional.devotionalTextEnglish;

    document.getElementById('toggleLang').textContent = isTokPisin
      ? 'Switch to English'
      : 'Switch to Tok Pisin';
  }

  document.getElementById('toggleLang').addEventListener('click', () => {
    isTokPisin = !isTokPisin;
    updateContent();
  });

  updateContent(); // Initial render
}
