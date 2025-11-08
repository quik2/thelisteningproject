import express, { Request, Response } from 'express';
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

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
  console.error('Error: Missing Spotify credentials in .env file');
  process.exit(1);
}

// In-memory token cache
let accessToken: string | null = null;
let tokenExpiry: number | null = null;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Path to submissions database
const SUBMISSIONS_PATH = path.join(__dirname, 'data', 'submissions.json');

// Spotify API types
interface SpotifyAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ id: string; name: string }>;
  album: {
    id: string;
    name: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
  duration_ms: number;
  preview_url: string | null;
}

interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
    total: number;
  };
}

interface Submission {
  id: string;
  songName: string;
  artistName: string;
  albumName: string;
  albumCover: string;
  previewUrl?: string | null;
  userText: string;
  submittedBy: string;
  timestamp: string;
  likes?: number;
}

// Get Spotify access token
async function getSpotifyToken(): Promise<string> {
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

  const data = await response.json() as SpotifyAuthResponse;
  accessToken = data.access_token;
  // Set expiry to 5 minutes before actual expiry for safety
  tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

  return accessToken;
}

// API endpoint to search tracks
app.get('/api/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const limit = (req.query.limit as string) || '10';

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const token = await getSpotifyToken();

    const params = new URLSearchParams({
      q: query,
      type: 'track',
      limit: limit,
      market: 'GB', // Try UK market - often has better preview availability
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

    const data = await response.json() as SpotifySearchResponse;
    console.log('Spotify returned tracks:', data.tracks.items.length);
    console.log('First track preview_url from Spotify:', data.tracks.items[0]?.preview_url);
    res.json(data.tracks.items);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// API endpoint to get a specific track
app.get('/api/track/:id', async (req: Request, res: Response) => {
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

    const data = await response.json() as SpotifyTrack;
    res.json(data);
  } catch (error) {
    console.error('Get track error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get all submissions
app.get('/api/submissions', async (req: Request, res: Response) => {
  try {
    const data = await fs.readFile(SUBMISSIONS_PATH, 'utf-8');
    const submissions = JSON.parse(data) as Submission[];
    res.json(submissions);
  } catch (error) {
    console.error('Error reading submissions:', error);
    res.status(500).json({ error: 'Failed to load submissions' });
  }
});

// Create new submission
app.post('/api/submissions', async (req: Request, res: Response) => {
  try {
    const { songName, artistName, albumName, albumCover, previewUrl, userText, submittedBy } = req.body;

    if (!songName || !artistName || !albumName || !userText) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Read existing submissions
    const data = await fs.readFile(SUBMISSIONS_PATH, 'utf-8');
    const submissions = JSON.parse(data) as Submission[];

    // Create new submission
    const newSubmission: Submission = {
      id: Date.now().toString(),
      songName,
      artistName,
      albumName,
      albumCover,
      previewUrl: previewUrl || null,
      userText,
      submittedBy: submittedBy || 'Anonymous',
      timestamp: new Date().toISOString(),
      likes: 0,
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

// Like a submission
app.post('/api/submissions/:id/like', async (req: Request, res: Response) => {
  try {
    const submissionId = req.params.id;

    // Read existing submissions
    const data = await fs.readFile(SUBMISSIONS_PATH, 'utf-8');
    const submissions = JSON.parse(data) as Submission[];

    // Find the submission
    const submission = submissions.find(s => s.id === submissionId);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Increment likes
    submission.likes = (submission.likes || 0) + 1;

    // Save back to file
    await fs.writeFile(SUBMISSIONS_PATH, JSON.stringify(submissions, null, 2));

    res.json({ likes: submission.likes });
  } catch (error) {
    console.error('Error liking submission:', error);
    res.status(500).json({ error: 'Failed to like submission' });
  }
});

// Unlike a submission
app.post('/api/submissions/:id/unlike', async (req: Request, res: Response) => {
  try {
    const submissionId = req.params.id;

    // Read existing submissions
    const data = await fs.readFile(SUBMISSIONS_PATH, 'utf-8');
    const submissions = JSON.parse(data) as Submission[];

    // Find the submission
    const submission = submissions.find(s => s.id === submissionId);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Decrement likes (don't go below 0)
    submission.likes = Math.max((submission.likes || 0) - 1, 0);

    // Save back to file
    await fs.writeFile(SUBMISSIONS_PATH, JSON.stringify(submissions, null, 2));

    res.json({ likes: submission.likes });
  } catch (error) {
    console.error('Error unliking submission:', error);
    res.status(500).json({ error: 'Failed to unlike submission' });
  }
});

// Smart search across all submissions
app.get('/api/submissions/search', async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string)?.toLowerCase();

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const data = await fs.readFile(SUBMISSIONS_PATH, 'utf-8');
    const submissions = JSON.parse(data) as Submission[];

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
