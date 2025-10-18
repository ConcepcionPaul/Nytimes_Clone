export async function handler(event) {
  const API_KEY = process.env.NYT_API_KEY;
  const url = `https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key=${API_KEY}`;
  try {
    const r = await fetch(url);
    const data = await r.json();
    return {
      statusCode: 200,
      headers: {
        'content-type': 'application/json',
        'access-control-allow-origin': '*',
      },
      body: JSON.stringify(data),
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: 'proxy_failed' }) };
  }
}
