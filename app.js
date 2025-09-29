document.getElementById("date").textContent = `Date: ${new Date().toDateString()}`;

fetch('devotionals.json')
  .then(response => response.json())
  .then(data => {
    const devotional = data[0]; // Load the first devotional

    document.getElementById('title').textContent = devotional.title;
    document.getElementById('scripture').textContent = devotional.scripture.tokPisin;
    document.getElementById('reference').textContent = `(${devotional.scripture.reference})`;
    document.getElementById('devotion').textContent = devotional.devotionalText;
    document.getElementById('audioPlayer').src = devotional.audioUrl;
  })
  .catch(error => console.error('Error loading devotionals:', error));
