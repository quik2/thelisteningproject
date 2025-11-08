// Shared TypeScript types for the application

export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
}

export interface SpotifyAlbum {
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

export interface Submission {
  id: string;
  songName: string;
  artistName: string;
  albumName: string;
  albumCover: string;
  userText: string;
  submittedBy: string;
  timestamp: string;
}
