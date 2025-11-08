import { useState, useEffect, useRef } from 'react';
import SearchDropdown from './SearchDropdown';
import './SearchBar.css';

function SearchBar({
  onSearch,
  onFilterSelect,
  onClearFilter,
  activeFilter,
  submissions = [],
  placeholder = 'Find songs, artists, albums, or memories'
}) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchBarRef = useRef(null);
  const chipRef = useRef(null);

  // Show dropdown when typing (but don't trigger search)
  useEffect(() => {
    if (query.trim().length >= 1 && !activeFilter) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [query, activeFilter]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = () => {
    setQuery('');
    setHasSearched(false);
    onSearch(''); // Reset to show all
    if (activeFilter) {
      onClearFilter();
    }
  };

  const handleKeyDown = (e) => {
    // Delete filter chip with backspace when input is empty
    if (e.key === 'Backspace' && !query && activeFilter) {
      e.preventDefault();
      onClearFilter();
      return;
    }

    if (e.key === 'Enter') {
      setShowDropdown(false);
      setHasSearched(true);
      setIsSearching(true);
      onSearch(query, true); // Pass true to force refresh

      // Remove searching animation after 300ms
      setTimeout(() => setIsSearching(false), 300);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const handleFilterSelect = (type, value, displayName) => {
    setQuery('');
    setShowDropdown(false);
    setHasSearched(false);
    onFilterSelect(type, value, displayName);
  };

  // Update CSS variable when chip width changes
  useEffect(() => {
    if (chipRef.current && activeFilter) {
      const chipWidth = chipRef.current.offsetWidth;
      searchBarRef.current?.style.setProperty('--chip-width', `${chipWidth}px`);
    }
  }, [activeFilter]);

  return (
    <div className="search-bar-wrapper" ref={searchBarRef}>
      <div className={`search-bar ${activeFilter ? 'has-filter' : ''} ${isSearching ? 'searching' : ''}`}>
        <div className="search-input-wrapper">
          {activeFilter && (
            <div className="filter-chip-inline" ref={chipRef}>
              <span className="filter-chip-type">{activeFilter.type}:</span>
              <span className="filter-chip-name">{activeFilter.displayName}</span>
              <button
                className="filter-chip-remove"
                onClick={onClearFilter}
                aria-label="Remove filter"
              >
                ×
              </button>
            </div>
          )}
          <input
            type="text"
            className="search-input"
            placeholder={activeFilter ? 'Search within...' : placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        {(query || activeFilter) && (
          <button className="search-clear" onClick={handleClear} aria-label="Clear all">
            ×
          </button>
        )}
      </div>
      {showDropdown && (
        <SearchDropdown
          query={query}
          submissions={submissions}
          onSelect={handleFilterSelect}
          onClose={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}

export default SearchBar;
