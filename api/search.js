let accessToken = null;
let tokenExpiry = null;

async function getSpotifyToken() {
  // Return cached token if still valid
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

  const credentials = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.statusText}`);
  }

  const data = await response.json();
  accessToken = data.access_token;
  // Set expiry to 5 minutes before actual expiry for safety
  tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

  return accessToken;
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { q: query, limit = '10' } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const token = await getSpotifyToken();

    const params = new URLSearchParams({
      q: query,
      type: 'track,album',
      limit: limit,
      market: 'GB',
    });

    const response = await fetch(
      `https://api.spotify.com/v1/search?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const data = await response.json();

    // Combine tracks and albums into a single array with type indicator
    const tracks = (data.tracks?.items || []).map(track => ({
      ...track,
      type: 'track'
    }));

    const albums = (data.albums?.items || []).map(album => ({
      ...album,
      type: 'album'
    }));

    // Interleave tracks and albums for better results
    const results = [];
    const maxLength = Math.max(tracks.length, albums.length);
    for (let i = 0; i < maxLength; i++) {
      if (i < tracks.length) results.push(tracks[i]);
      if (i < albums.length) results.push(albums[i]);
    }

    return res.status(200).json(results.slice(0, parseInt(limit)));
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ error: error.message || 'Unknown error' });
  }
}
