import { setupLanguageToggle } from './language-toggle.js';

document.getElementById("date").textContent = `Date: ${new Date().toDateString()}`;

fetch('devotionals.json')
  .then(response => response.json())
  .then(data => {
    const devotional = data[0]; // Load the first devotional

    document.getElementById('title').textContent = devotional.title;
    document.getElementById('reference').textContent = `(${devotional.scripture.reference})`;
    document.getElementById('audioPlayer').src = devotional.audioUrl;

    setupLanguageToggle(devotional);
  })
  .catch(error => console.error('Error loading devotionals:', error));

