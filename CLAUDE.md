# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal blog website — plain HTML/CSS/JS, deployed to GitHub Pages. Supports English and Thai content, dark mode, tag filtering, and client-side search.

## Running the Project

Always serve via HTTP (not `file://`) so `fetch()` works:

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080.

## Project Structure

```
claude-101/
├── index.html              # Homepage: post list, search, tag filter
├── post.html               # Post viewer (reads ?slug= query param)
├── 404.html                # GitHub Pages custom 404
├── css/
│   ├── variables.css       # All design tokens (colors, fonts, spacing)
│   ├── reset.css           # Minimal CSS reset
│   ├── typography.css      # Type scale, Thai language rules, prose styles
│   ├── layout.css          # Header, container, grid, footer, responsive
│   ├── components.css      # Cards, tags, search input, toggle button
│   └── dark.css            # [data-theme="dark"] variable overrides only
├── js/
│   ├── theme.js            # Sync dark mode (no defer) — prevents FOUC
│   ├── posts.js            # Fetch posts.json, render cards, expose globals
│   ├── filter.js           # Tag bar, tag selection, applyFilters()
│   ├── search.js           # Input listener, debounce 200ms, calls applyFilters
│   └── post-loader.js      # On post.html: fetch metadata + HTML fragment
├── data/
│   └── posts.json          # Edit this to publish new posts
├── posts/
│   └── hello-world.html    # Sample post body (HTML fragment, no <html>/<head>)
└── assets/
    └── favicon.svg         # SVG monogram favicon
```

## Adding a New Post

1. Write `posts/my-slug.html` — HTML fragment only, no `<html>`/`<head>` wrapper. Use `.lang-th` class on Thai paragraphs.
2. Add an entry to **the top** of the `posts` array in `data/posts.json` with `"published": true`.
3. `git add . && git commit -m "Add post: ..." && git push origin main`

GitHub Pages deploys in ~1 minute.

## posts.json Schema

```json
{
  "posts": [{
    "slug": "my-post",
    "title": "Post Title",
    "title_th": "ชื่อโพสต์",
    "lang": "en",
    "date": "2026-07-27",
    "tags": ["tag1", "tag2"],
    "category": "personal",
    "excerpt": "Short English summary shown on card.",
    "excerpt_th": "สรุปสั้น ๆ ภาษาไทย",
    "reading_time": 3,
    "published": true
  }]
}
```

Set `"published": false` to hide a post without deleting it.

## Design System

- **Colors:** White (#FFF), Black (#111), Navy (#1B2A4A) — softened to #4A6FA5 in dark mode for WCAG AA contrast
- **Fonts:** Poppins (Latin) + Noto Sans Thai — loaded from Google Fonts, browser picks per-character
- **Dark mode:** Stored in `localStorage` as `blog-theme`, applied via `[data-theme="dark"]` CSS selector

## JavaScript Architecture

Script load order in `index.html` (critical):
1. `theme.js` — **sync, no defer** — sets `data-theme` before first paint
2. `posts.js` — fetches JSON, dispatches `blog:posts-loaded` event
3. `filter.js` — listens for `blog:posts-loaded`, builds tag bar, renders cards
4. `search.js` — debounced input, calls `window.__blogApplyFilters()`

## Claude Code Config

- `.claude/settings.local.json` — Claude Code permissions configuration
