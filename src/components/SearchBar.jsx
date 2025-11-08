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
  const searchBarRef = useRef(null);

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
    if (e.key === 'Enter') {
      setShowDropdown(false);
      setHasSearched(true);
      onSearch(query);
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

  return (
    <div className="search-bar-wrapper" ref={searchBarRef}>
      <div className={`search-bar ${activeFilter ? 'has-filter' : ''}`}>
        <input
          type="text"
          className="search-input"
          placeholder={activeFilter ? `Filtering by ${activeFilter.type}...` : placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {(query || activeFilter) && (
          <button className="search-clear" onClick={handleClear} aria-label="Clear search">
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
