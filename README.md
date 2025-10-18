# NYTimes Clone Book Review

A lightweight front-end that displays the current NYTimes Hardcover Fiction list with search, suggestions, pagination, accessibility improvements, and performance polish.

## Run locally
- Open `docs/index.html` directly in your browser. No build step required.
- For development, edit files in `src/`.

## Deploy with GitHub Pages
1. Push changes to `main`.
2. Repo → Settings → Pages → Build and deployment: Deploy from a branch → Branch: `main`, Folder: `/docs` → Save.
3. Wait ~2–3 minutes, then visit `https://<username>.github.io/Nytimes_Clone/`.
4. If styling looks stale, hard-refresh (Ctrl+F5) or open a private window. `docs/index.html` includes cache-busting on CSS/JS query params.

## Features
- Debounced search with title/author/description match
- Suggestions with keyboard navigation (Arrow keys, Enter) and outside-click close
- Pagination with a "Load More" button and persistent visible count
- Loading skeletons, lazy-loaded images, localStorage caching
- ARIA roles and labels, `aria-live` updates
- Preconnects for faster NYT API and Cloudinary image loading

## API key security (optional)
GitHub Pages is fully static, so the NYT API key is public in the client. To keep the key private, deploy to Netlify or Vercel and use a serverless function proxy.

### Netlify function (example)
- File: `netlify/functions/nyt-proxy.js`
```js
export async function handler(event) {
  const API_KEY = process.env.NYT_API_KEY;
  const url = `https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key=${API_KEY}`;
  try {
    const r = await fetch(url);
    const data = await r.json();
    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' },
      body: JSON.stringify(data),
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: 'proxy_failed' }) };
  }
}
```

Deploy steps:
- Set `NYT_API_KEY` in your Netlify site environment variables.
- Update the frontend fetch URL in `src/script.js` and `docs/index.628286c6.js` to `/ .netlify/functions/nyt-proxy`.
- Deploy the site to Netlify; Netlify will serve functions under that path.

## Troubleshooting
- CSS/JS not loading on GitHub Pages:
  - Ensure Pages source is `main` → `/docs`.
  - Hard refresh or use a private window.
  - In DevTools → Network, verify `index.2da419fd.css` and `index.628286c6.js` load (HTTP 200).
- NYT API errors: verify the key is valid; if using a proxy, confirm the env var is set and the function returns HTTP 200.
