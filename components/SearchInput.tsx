
import React, { useState } from 'react';

interface SearchInputProps {
  initialValue?: string;
  onSearch: (query: string) => void;
  className?: string;
  autoFocus?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({ initialValue = '', onSearch, className = '', autoFocus = false }) => {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative group ${className}`}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={query}
        autoFocus={autoFocus}
        onChange={(e) => setQuery(e.target.value)}
        className="block w-full py-3 pl-11 pr-4 text-gray-900 border border-gray-200 rounded-full bg-white hover:shadow-md focus:shadow-md focus:outline-none transition-shadow duration-200"
        placeholder="Search Wikipedia..."
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery('')}
          className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </form>
  );
};

export default SearchInput;
