import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = 3000;

// Spotify credentials
const SPOTIFY_CLIENT_ID = process.env.VITE_SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.VITE_SPOTIFY_CLIENT_SECRET;

// In-memory token cache
let accessToken = null;
let tokenExpiry = null;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Path to submissions database
const SUBMISSIONS_PATH = path.join(__dirname, 'data', 'submissions.json');

// Get Spotify access token
async function getSpotifyToken() {
  // Return cached token if still valid
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

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

// API endpoint to search tracks
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q;
    const limit = req.query.limit || 10;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const token = await getSpotifyToken();

    const params = new URLSearchParams({
      q: query,
      type: 'track',
      limit: limit.toString(),
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
    res.json(data.tracks.items);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to get a specific track
app.get('/api/track/:id', async (req, res) => {
  try {
    const trackId = req.params.id;
    const token = await getSpotifyToken();

    const response = await fetch(
      `https://api.spotify.com/v1/tracks/${trackId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get track: ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Get track error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all submissions
app.get('/api/submissions', async (req, res) => {
  try {
    // Add cache control headers for better performance
    res.setHeader('Cache-Control', 'public, max-age=60'); // Cache for 1 minute

    const data = await fs.readFile(SUBMISSIONS_PATH, 'utf-8');
    const submissions = JSON.parse(data);
    res.json(submissions);
  } catch (error) {
    console.error('Error reading submissions:', error);
    res.status(500).json({ error: 'Failed to load submissions' });
  }
});

// Create new submission
app.post('/api/submissions', async (req, res) => {
  try {
    const { songName, artistName, albumName, albumCover, userText, submittedBy } = req.body;

    if (!songName || !artistName || !albumName || !userText) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Read existing submissions
    const data = await fs.readFile(SUBMISSIONS_PATH, 'utf-8');
    const submissions = JSON.parse(data);

    // Create new submission
    const newSubmission = {
      id: Date.now().toString(),
      songName,
      artistName,
      albumName,
      albumCover,
      userText,
      submittedBy: submittedBy || 'Anonymous',
      timestamp: new Date().toISOString(),
    };

    // Add to submissions
    submissions.unshift(newSubmission); // Add to beginning

    // Save back to file
    await fs.writeFile(SUBMISSIONS_PATH, JSON.stringify(submissions, null, 2));

    res.status(201).json(newSubmission);
  } catch (error) {
    console.error('Error creating submission:', error);
    res.status(500).json({ error: 'Failed to create submission' });
  }
});

// Smart search across all submissions
app.get('/api/submissions/search', async (req, res) => {
  try {
    const query = req.query.q?.toLowerCase();

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const data = await fs.readFile(SUBMISSIONS_PATH, 'utf-8');
    const submissions = JSON.parse(data);

    // Search across all fields
    const results = submissions.filter(submission => {
      return (
        submission.songName.toLowerCase().includes(query) ||
        submission.artistName.toLowerCase().includes(query) ||
        submission.albumName.toLowerCase().includes(query) ||
        submission.userText.toLowerCase().includes(query) ||
        submission.submittedBy.toLowerCase().includes(query)
      );
    });

    res.json(results);
  } catch (error) {
    console.error('Error searching submissions:', error);
    res.status(500).json({ error: 'Failed to search submissions' });
  }
});

app.listen(PORT, () => {
  console.log(`🎵 Listening Project server running at http://localhost:${PORT}`);
  console.log(`📡 Spotify API connected`);
  console.log(`💾 Database: ${SUBMISSIONS_PATH}`);
});
