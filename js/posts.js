// posts.js — fetches posts.json, renders post cards, exposes globals.
// Loaded with defer: DOM is ready when this runs.

window.__blogPosts = [];

function escapeHtml(str) {
  var div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

function formatDate(dateStr) {
  var date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function renderPostCards(posts, container) {
  if (!container) return;

  if (posts.length === 0) {
    container.innerHTML =
      '<div class="empty-state">' +
        '<strong>No posts found</strong>' +
        '<p>Try a different search term or remove the tag filter.</p>' +
      '</div>';
    return;
  }

  container.innerHTML = posts.map(function (post) {
    var tags = (post.tags || []).map(function (tag) {
      return '<span class="tag">' + escapeHtml(tag) + '</span>';
    }).join('');

    return (
      '<a href="post.html?slug=' + encodeURIComponent(post.slug) + '" class="post-card">' +
        '<h2 class="post-card-title">' + escapeHtml(post.title) + '</h2>' +
        '<p class="post-card-excerpt">' + escapeHtml(post.excerpt || '') + '</p>' +
        '<div class="post-card-footer">' +
          '<span class="post-card-meta">' +
            formatDate(post.date) + ' &middot; ' + post.reading_time + ' min read' +
          '</span>' +
          (tags ? '<div class="post-card-tags">' + tags + '</div>' : '') +
        '</div>' +
      '</a>'
    );
  }).join('');
}

window.__blogRenderPostCards = renderPostCards;

// Show skeleton while fetching
(function showSkeleton() {
  var container = document.getElementById('post-list');
  if (!container) return;
  var card = '<div class="skeleton">' +
    '<div class="skeleton-line long"></div>' +
    '<div class="skeleton-line medium"></div>' +
    '<div class="skeleton-line short"></div>' +
  '</div>';
  container.innerHTML = card + card;
})();

// Fetch and initialise
fetch('data/posts.json')
  .then(function (res) {
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  })
  .then(function (data) {
    window.__blogPosts = (data.posts || [])
      .filter(function (p) { return p.published !== false; })
      .sort(function (a, b) { return new Date(b.date) - new Date(a.date); });

    // Signal that posts are ready — filter.js listens for this
    document.dispatchEvent(new CustomEvent('blog:posts-loaded'));
  })
  .catch(function (err) {
    console.error('[posts.js] Failed to load posts:', err);
    var container = document.getElementById('post-list');
    if (container) {
      container.innerHTML =
        '<div class="empty-state">' +
          '<strong>Could not load posts</strong>' +
          '<p>Make sure you are running via a local server (not file://).</p>' +
        '</div>';
    }
  });
