// filter.js — builds the tag bar and coordinates filtering.
// Loaded with defer after posts.js. Listens for 'blog:posts-loaded'.

(function () {
  var activeTag = null;

  // Check for ?tag= URL param on load (linked from post page)
  var urlTag = new URLSearchParams(window.location.search).get('tag');
  if (urlTag) activeTag = urlTag;

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }

  function buildTagBar(posts) {
    var tagBar = document.getElementById('tag-bar');
    if (!tagBar) return;

    // Count occurrences per tag
    var tagCounts = {};
    posts.forEach(function (post) {
      (post.tags || []).forEach(function (tag) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    var tags = Object.keys(tagCounts).sort();
    if (tags.length === 0) {
      tagBar.style.display = 'none';
      return;
    }

    // Validate URL tag against actual tags
    if (activeTag && !tagCounts[activeTag]) {
      activeTag = null;
    }

    tagBar.innerHTML =
      '<span class="tag-bar-label">Filter:</span>' +
      '<button class="tag' + (activeTag === null ? ' active' : '') + '" data-tag="all">All</button>' +
      tags.map(function (tag) {
        var isActive = activeTag === tag;
        return '<button class="tag' + (isActive ? ' active' : '') + '" data-tag="' +
          escapeHtml(tag) + '">' + escapeHtml(tag) +
          ' <span style="opacity:0.55;font-size:0.9em">(' + tagCounts[tag] + ')</span>' +
          '</button>';
      }).join('');

    tagBar.querySelectorAll('[data-tag]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        tagBar.querySelectorAll('[data-tag]').forEach(function (b) {
          b.classList.remove('active');
        });
        btn.classList.add('active');
        activeTag = btn.dataset.tag === 'all' ? null : btn.dataset.tag;
        applyFilters();
      });
    });
  }

  function applyFilters() {
    var posts = window.__blogPosts || [];
    var query = (window.__blogSearchQuery || '').toLowerCase().trim();
    var container = document.getElementById('post-list');
    var countEl = document.getElementById('results-count');

    var filtered = posts;

    if (activeTag) {
      filtered = filtered.filter(function (p) {
        return (p.tags || []).indexOf(activeTag) !== -1;
      });
    }

    if (query) {
      filtered = filtered.filter(function (p) {
        return (p.title || '').toLowerCase().indexOf(query) !== -1 ||
          (p.title_th || '').indexOf(query) !== -1 ||
          (p.excerpt || '').toLowerCase().indexOf(query) !== -1 ||
          (p.excerpt_th || '').indexOf(query) !== -1 ||
          (p.tags || []).some(function (t) {
            return t.toLowerCase().indexOf(query) !== -1;
          });
      });
    }

    if (countEl) {
      if (filtered.length === posts.length) {
        countEl.textContent = posts.length + ' post' + (posts.length !== 1 ? 's' : '');
      } else {
        countEl.textContent = filtered.length + ' of ' + posts.length + ' post' + (posts.length !== 1 ? 's' : '');
      }
    }

    if (window.__blogRenderPostCards && container) {
      window.__blogRenderPostCards(filtered, container);
    }
  }

  // Expose so search.js can call it
  window.__blogApplyFilters = applyFilters;

  // Run once posts are ready
  document.addEventListener('blog:posts-loaded', function () {
    buildTagBar(window.__blogPosts);
    applyFilters();
  });
})();
