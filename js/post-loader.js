// post-loader.js — loads post metadata + HTML fragment for post.html.
// Reads ?slug= param, validates, parallel-fetches posts.json + posts/{slug}.html.

(function () {
  var params = new URLSearchParams(window.location.search);
  var slug = params.get('slug');

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }

  function formatDate(dateStr) {
    var date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function showError(msg) {
    var loadingEl = document.getElementById('post-loading');
    if (loadingEl) {
      loadingEl.innerHTML =
        '<div class="empty-state">' +
          '<strong>Could not load post</strong>' +
          '<p>' + escapeHtml(msg) + '</p>' +
          '<p style="margin-top:1rem"><a href="index.html" style="color:var(--color-accent)">&larr; Back to all posts</a></p>' +
        '</div>';
    }
  }

  // Validate slug: only lowercase letters, digits, and hyphens
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    showError('Invalid post URL.');
    return;
  }

  // Parallel fetch: metadata + body
  Promise.all([
    fetch('data/posts.json'),
    fetch('posts/' + slug + '.html')
  ])
    .then(function (responses) {
      var metaRes = responses[0];
      var bodyRes = responses[1];

      if (!metaRes.ok) throw new Error('Could not load post list.');
      if (!bodyRes.ok) throw new Error('Post not found (404).');

      return Promise.all([metaRes.json(), bodyRes.text()]);
    })
    .then(function (results) {
      var data = results[0];
      var bodyHtml = results[1];

      var post = (data.posts || []).find(function (p) {
        return p.slug === slug && p.published !== false;
      });

      if (!post) {
        showError('Post not found or not yet published.');
        return;
      }

      // Update page title
      document.title = post.title + ' — My Blog';

      // Render title
      var titleEl = document.getElementById('post-title');
      if (titleEl) titleEl.textContent = post.title;

      // Render meta: date · reading time · tags
      var metaEl = document.getElementById('post-meta');
      if (metaEl) {
        var tagLinks = (post.tags || []).map(function (tag) {
          return '<a href="index.html?tag=' + encodeURIComponent(tag) + '" class="tag">' +
            escapeHtml(tag) + '</a>';
        }).join('');

        metaEl.innerHTML =
          '<span>' + formatDate(post.date) + '</span>' +
          '<span class="post-meta-sep">&middot;</span>' +
          '<span>' + post.reading_time + ' min read</span>' +
          (tagLinks
            ? '<span class="post-meta-sep">&middot;</span>' + tagLinks
            : '');
      }

      // Inject body HTML (trusted content from our own posts/ directory)
      var bodyEl = document.getElementById('post-body');
      if (bodyEl) {
        bodyEl.innerHTML = bodyHtml;
        // Apply Thai line-height rules if post is primarily Thai
        if (post.lang === 'th') {
          bodyEl.classList.add('lang-th');
        }
      }

      // Set html lang attribute to match post language
      if (post.lang) {
        document.documentElement.setAttribute('lang', post.lang);
      }

      // Hide skeleton, show content
      var loadingEl = document.getElementById('post-loading');
      var contentEl = document.getElementById('post-content');
      if (loadingEl) loadingEl.style.display = 'none';
      if (contentEl) contentEl.style.display = 'block';
    })
    .catch(function (err) {
      showError(err.message || 'Failed to load post.');
    });
})();
