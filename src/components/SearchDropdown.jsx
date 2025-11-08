import React, { useMemo } from 'react';
import './SearchDropdown.css';

const SearchDropdown = ({ query, submissions, onSelect, onClose }) => {
  const suggestions = useMemo(() => {
    if (!query || query.trim().length < 2) return null;

    const searchQuery = query.toLowerCase().trim();

    // Collect all unique items with relevance scoring
    const items = new Map();

    submissions.forEach(submission => {
      const songName = submission.songName;
      const artistName = submission.artistName;
      const albumName = submission.albumName;

      // Song match
      if (songName.toLowerCase().includes(searchQuery)) {
        const key = `song:${songName}`;
        if (!items.has(key)) {
          const exactMatch = songName.toLowerCase() === searchQuery;
          const startsWithMatch = songName.toLowerCase().startsWith(searchQuery);
          const relevance = exactMatch ? 1000 : startsWithMatch ? 500 : 100;

          items.set(key, {
            type: 'song',
            name: songName,
            artist: artistName,
            albumCover: submission.albumCover,
            count: 1,
            relevance
          });
        } else {
          items.get(key).count++;
        }
      }

      // Artist match
      if (artistName.toLowerCase().includes(searchQuery)) {
        const key = `artist:${artistName}`;
        if (!items.has(key)) {
          const exactMatch = artistName.toLowerCase() === searchQuery;
          const startsWithMatch = artistName.toLowerCase().startsWith(searchQuery);
          const relevance = exactMatch ? 1000 : startsWithMatch ? 500 : 100;

          items.set(key, {
            type: 'artist',
            name: artistName,
            albumCover: submission.albumCover,
            count: 1,
            relevance
          });
        } else {
          items.get(key).count++;
        }
      }

      // Album match
      if (albumName.toLowerCase().includes(searchQuery)) {
        const key = `album:${albumName}`;
        if (!items.has(key)) {
          const exactMatch = albumName.toLowerCase() === searchQuery;
          const startsWithMatch = albumName.toLowerCase().startsWith(searchQuery);
          const relevance = exactMatch ? 1000 : startsWithMatch ? 500 : 100;

          items.set(key, {
            type: 'album',
            name: albumName,
            artist: artistName,
            albumCover: submission.albumCover,
            count: 1,
            relevance
          });
        } else {
          items.get(key).count++;
        }
      }
    });

    // Convert to array and sort by relevance, then by count
    const results = Array.from(items.values())
      .sort((a, b) => {
        if (b.relevance !== a.relevance) return b.relevance - a.relevance;
        return b.count - a.count;
      })
      .slice(0, 8);

    return results.length > 0 ? results : null;
  }, [query, submissions]);

  if (!suggestions) {
    return null;
  }

  const handleSelect = (item) => {
    onSelect(item.type, item.name, item.name);
    onClose();
  };

  return (
    <div className="search-dropdown">
      {suggestions.map((item, index) => (
        <div
          key={`${item.type}-${index}`}
          className="dropdown-item"
          onClick={() => handleSelect(item)}
        >
          <img
            src={item.albumCover}
            alt={item.name}
            className="item-thumbnail"
          />
          <div className="item-info">
            <div className="item-name">{item.name}</div>
            {item.artist && (
              <div className="item-meta">{item.artist}</div>
            )}
          </div>
          <div className="item-right">
            <span className="item-type">{item.type}</span>
            {item.count > 1 && (
              <span className="item-count">{item.count}</span>
            )}
          </div>
        </div>
      ))}

      <div className="dropdown-footer">
        press enter to search all fields
      </div>
    </div>
  );
};

export default SearchDropdown;
