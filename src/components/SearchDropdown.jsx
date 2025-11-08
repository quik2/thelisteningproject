import React, { useMemo } from 'react';
import Fuse from 'fuse.js';
import './SearchDropdown.css';

const SearchDropdown = ({ query, submissions, onSelect, onClose }) => {
  const suggestions = useMemo(() => {
    if (!query || query.trim().length < 1) return null;

    const searchQuery = query.trim();

    // Build searchable items from submissions
    const searchableItems = [];
    const itemMap = new Map();

    submissions.forEach(submission => {
      // Songs
      const songKey = `song:${submission.songName}`;
      if (!itemMap.has(songKey)) {
        searchableItems.push({
          type: 'song',
          name: submission.songName,
          artist: submission.artistName,
          albumCover: submission.albumCover,
          searchText: submission.songName,
          key: songKey,
          count: 1
        });
        itemMap.set(songKey, searchableItems[searchableItems.length - 1]);
      } else {
        itemMap.get(songKey).count++;
      }

      // Artists
      const artistKey = `artist:${submission.artistName}`;
      if (!itemMap.has(artistKey)) {
        searchableItems.push({
          type: 'artist',
          name: submission.artistName,
          albumCover: submission.albumCover,
          searchText: submission.artistName,
          key: artistKey,
          count: 1
        });
        itemMap.set(artistKey, searchableItems[searchableItems.length - 1]);
      } else {
        itemMap.get(artistKey).count++;
      }

      // Albums
      const albumKey = `album:${submission.albumName}`;
      if (!itemMap.has(albumKey)) {
        searchableItems.push({
          type: 'album',
          name: submission.albumName,
          artist: submission.artistName,
          albumCover: submission.albumCover,
          searchText: submission.albumName,
          key: albumKey,
          count: 1
        });
        itemMap.set(albumKey, searchableItems[searchableItems.length - 1]);
      } else {
        itemMap.get(albumKey).count++;
      }
    });

    // Configure Fuse.js for fuzzy search
    const fuse = new Fuse(searchableItems, {
      keys: ['searchText'],
      threshold: 0.3, // Lower = stricter, 0.3 allows for some typos
      distance: 100,
      minMatchCharLength: 1,
      includeScore: true
    });

    // Perform fuzzy search
    const fuseResults = fuse.search(searchQuery);

    // Get unique results and sort by score (lower is better), then by count
    const results = fuseResults
      .map(result => ({
        ...result.item,
        score: result.score
      }))
      .sort((a, b) => {
        if (a.score !== b.score) return a.score - b.score;
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
          className={`dropdown-item dropdown-item-${item.type}`}
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
          <span className={`item-type item-type-${item.type}`}>{item.type}</span>
        </div>
      ))}

      <div className="dropdown-footer">
        press enter to search all fields
      </div>
    </div>
  );
};

export default SearchDropdown;
