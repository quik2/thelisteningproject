import { useState, useEffect } from 'react';
import './SearchBar.css';

function SearchBar({ onSearch, placeholder = 'search for anything' }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, onSearch]);

  const handleClear = () => {
    setQuery('');
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query && (
        <button className="search-clear" onClick={handleClear} aria-label="Clear search">
          ×
        </button>
      )}
    </div>
  );
}

export default SearchBar;
