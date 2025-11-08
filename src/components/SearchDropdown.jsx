import React, { useMemo } from 'react';
import './SearchDropdown.css';

const SearchDropdown = ({ query, submissions, onSelect, onClose }) => {
  const suggestions = useMemo(() => {
    if (!query || query.trim().length < 2) return null;

    const searchQuery = query.toLowerCase().trim();

    // Extract unique songs, artists, and albums from submissions
    const songs = new Map();
    const artists = new Map();
    const albums = new Map();

    submissions.forEach(submission => {
      const songName = submission.songName;
      const artistName = submission.artistName;
      const albumName = submission.albumName;

      // Songs - store with metadata
      if (songName.toLowerCase().includes(searchQuery)) {
        if (!songs.has(songName)) {
          songs.set(songName, {
            name: songName,
            artist: artistName,
            albumCover: submission.albumCover,
            count: 1
          });
        } else {
          songs.get(songName).count++;
        }
      }

      // Artists - count submissions
      if (artistName.toLowerCase().includes(searchQuery)) {
        if (!artists.has(artistName)) {
          artists.set(artistName, {
            name: artistName,
            count: 1,
            albumCover: submission.albumCover
          });
        } else {
          artists.get(artistName).count++;
        }
      }

      // Albums - store with metadata
      if (albumName.toLowerCase().includes(searchQuery)) {
        if (!albums.has(albumName)) {
          albums.set(albumName, {
            name: albumName,
            artist: artistName,
            albumCover: submission.albumCover,
            count: 1
          });
        } else {
          albums.get(albumName).count++;
        }
      }
    });

    // Convert to arrays and limit to top 5 each
    const songResults = Array.from(songs.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const artistResults = Array.from(artists.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const albumResults = Array.from(albums.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      songs: songResults,
      artists: artistResults,
      albums: albumResults,
      hasResults: songResults.length > 0 || artistResults.length > 0 || albumResults.length > 0
    };
  }, [query, submissions]);

  if (!suggestions || !suggestions.hasResults) {
    return null;
  }

  const handleSelect = (type, value, displayName) => {
    onSelect(type, value, displayName);
    onClose();
  };

  return (
    <div className="search-dropdown">
      {suggestions.songs.length > 0 && (
        <div className="dropdown-section">
          <div className="section-header">
            <span className="section-icon">🎵</span>
            <span className="section-title">Songs</span>
          </div>
          {suggestions.songs.map((song, index) => (
            <div
              key={`song-${index}`}
              className="dropdown-item"
              onClick={() => handleSelect('song', song.name, song.name)}
            >
              <img
                src={song.albumCover}
                alt={song.name}
                className="item-thumbnail"
              />
              <div className="item-info">
                <div className="item-name">{song.name}</div>
                <div className="item-meta">{song.artist}</div>
              </div>
              {song.count > 1 && (
                <span className="item-count">{song.count} submissions</span>
              )}
            </div>
          ))}
        </div>
      )}

      {suggestions.artists.length > 0 && (
        <div className="dropdown-section">
          <div className="section-header">
            <span className="section-icon">🎤</span>
            <span className="section-title">Artists</span>
          </div>
          {suggestions.artists.map((artist, index) => (
            <div
              key={`artist-${index}`}
              className="dropdown-item"
              onClick={() => handleSelect('artist', artist.name, artist.name)}
            >
              <img
                src={artist.albumCover}
                alt={artist.name}
                className="item-thumbnail"
              />
              <div className="item-info">
                <div className="item-name">{artist.name}</div>
              </div>
              <span className="item-count">{artist.count} submissions</span>
            </div>
          ))}
        </div>
      )}

      {suggestions.albums.length > 0 && (
        <div className="dropdown-section">
          <div className="section-header">
            <span className="section-icon">💿</span>
            <span className="section-title">Albums</span>
          </div>
          {suggestions.albums.map((album, index) => (
            <div
              key={`album-${index}`}
              className="dropdown-item"
              onClick={() => handleSelect('album', album.name, album.name)}
            >
              <img
                src={album.albumCover}
                alt={album.name}
                className="item-thumbnail"
              />
              <div className="item-info">
                <div className="item-name">{album.name}</div>
                <div className="item-meta">{album.artist}</div>
              </div>
              {album.count > 1 && (
                <span className="item-count">{album.count} submissions</span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="dropdown-footer">
        Press <kbd>Enter</kbd> to search all fields
      </div>
    </div>
  );
};

export default SearchDropdown;
