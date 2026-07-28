// search.js — debounced search input listener.
// Loaded with defer; DOM is ready when this runs.

window.__blogSearchQuery = '';

(function () {
  var input = document.getElementById('search-input');
  if (!input) return;

  var debounceTimer;

  input.addEventListener('input', function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      window.__blogSearchQuery = input.value;
      if (typeof window.__blogApplyFilters === 'function') {
        window.__blogApplyFilters();
      }
    }, 200);
  });

  // Clear search on Escape
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      input.value = '';
      window.__blogSearchQuery = '';
      if (typeof window.__blogApplyFilters === 'function') {
        window.__blogApplyFilters();
      }
    }
  });
})();
