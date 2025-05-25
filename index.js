// index.js
document.addEventListener('DOMContentLoaded', () => {
  const locations = {
    'da nang': 'danang.html',
    'hoi an': 'hoian.html',
    'hue': 'hue.html',
    // add more location-name-to-page mappings as needed
  };

  const form = document.getElementById('searchForm');
  const input = document.getElementById('searchInput');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const query = input.value.trim().toLowerCase();

    if (locations[query]) {
      window.location.href = locations[query];
    } else {
      alert('Sorry, location not found. Please try again.');
    }
  });
});
