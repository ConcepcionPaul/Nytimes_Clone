export async function handler(event) {
  const API_KEY = process.env.NYT_API_KEY;
  const allowedLists = new Set([
    'hardcover-fiction',
    'trade-fiction-paperback',
    'combined-print-and-e-book-fiction',
  ]);
  const requestedList = event.queryStringParameters?.list || 'hardcover-fiction';
  const list = allowedLists.has(requestedList) ? requestedList : 'hardcover-fiction';
  const url = `https://api.nytimes.com/svc/books/v3/lists/current/${list}.json?api-key=${API_KEY}`;
  try {
    const r = await fetch(url);
    if (!r.ok) {
      return { statusCode: r.status, body: JSON.stringify({ error: 'nyt_request_failed' }) };
    }
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
