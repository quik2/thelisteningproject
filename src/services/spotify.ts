// Spotify API service for searching tracks and getting album artwork

interface SpotifyAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

interface SpotifyArtist {
  id: string;
  name: string;
}

interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
  release_date: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  duration_ms: number;
  preview_url: string | null;
}

interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
    total: number;
  };
}

class SpotifyService {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    this.clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    this.clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

    if (!this.clientId || !this.clientSecret) {
      throw new Error('Spotify credentials not found in environment variables');
    }
  }

  /**
   * Get access token using Client Credentials flow
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const credentials = btoa(`${this.clientId}:${this.clientSecret}`);

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

    const data: SpotifyAuthResponse = await response.json();
    this.accessToken = data.access_token;
    // Set expiry to 5 minutes before actual expiry for safety
    this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

    return this.accessToken;
  }

  /**
   * Search for tracks by query string
   */
  async searchTracks(query: string, limit: number = 10): Promise<SpotifyTrack[]> {
    const token = await this.getAccessToken();

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

    const data: SpotifySearchResponse = await response.json();
    return data.tracks.items;
  }

  /**
   * Get a specific track by ID
   */
  async getTrack(trackId: string): Promise<SpotifyTrack> {
    const token = await this.getAccessToken();

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

    return await response.json();
  }

  /**
   * Helper to get the best quality album artwork URL
   */
  getBestAlbumArt(track: SpotifyTrack): string | null {
    if (!track.album.images || track.album.images.length === 0) {
      return null;
    }
    // Return the largest image (first in array)
    return track.album.images[0].url;
  }

  /**
   * Helper to format artist names
   */
  formatArtists(track: SpotifyTrack): string {
    return track.artists.map(artist => artist.name).join(', ');
  }
}

// Export a singleton instance
export const spotifyService = new SpotifyService();
