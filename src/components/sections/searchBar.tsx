'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

interface Suggestion {
  name: string;
  slug: string;
  type: 'product' | 'category';
}

interface SuggestionsResponse {
  success: boolean;
  data: {
    products: Suggestion[];
    categories: Suggestion[];
  };
}

export default function xSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestionsResponse['data'] | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch suggestions with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length < 2) {
        setSuggestions(null);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/search/suggestions?q=${encodeURIComponent(query)}&limit=5`
        );

        if (response.ok) {
          const data: SuggestionsResponse = await response.json();
          setSuggestions(data.data);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get all suggestions in a flat array for keyboard navigation
  const allSuggestions = suggestions
    ? [...suggestions.products, ...suggestions.categories]
    : [];

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || allSuggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < allSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          const selected = allSuggestions[selectedIndex];
          handleSuggestionClick(selected);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/s?k=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
      setQuery('');
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (suggestion.type === 'product') {
      router.push(`/products/${suggestion.slug}`);
    } else {
      router.push(`/shop/${suggestion.slug}`);
    }
    setShowSuggestions(false);
    setQuery('');
    setSelectedIndex(-1);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions(null);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div ref={searchRef} className="relative flex-1 max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions && query.length >= 2) {
              setShowSuggestions(true);
            }
          }}
          placeholder="Search for products, categories..."
          className="w-full pl-10 pr-20 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
        
        {/* Search Icon */}
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        
        {/* Clear Button */}
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-14 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        
        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={!query.trim()}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-amber-600 text-white px-4 py-1.5 rounded-md hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Search
        </button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions?.products.length || suggestions?.categories.length) ? (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {/* Loading State */}
          {loading && (
            <div className="px-4 py-3 text-sm text-gray-500">
              Searching...
            </div>
          )}

          {/* Products */}
          {!loading && suggestions?.products && suggestions.products.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                Products
              </div>
              {suggestions.products.map((product, index) => (
                <button
                  key={`product-${product.slug}`}
                  onClick={() => handleSuggestionClick(product)}
                  className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 ${
                    selectedIndex === index ? 'bg-gray-100' : ''
                  }`}
                >
                  <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-900 truncate">{product.name}</span>
                  <span className="ml-auto text-xs text-gray-500 flex-shrink-0">Product</span>
                </button>
              ))}
            </div>
          )}

          {/* Categories */}
          {!loading && suggestions?.categories && suggestions.categories.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                Categories
              </div>
              {suggestions.categories.map((category, index) => {
                const adjustedIndex = (suggestions?.products.length || 0) + index;
                return (
                  <button
                    key={`category-${category.slug}`}
                    onClick={() => handleSuggestionClick(category)}
                    className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 ${
                      selectedIndex === adjustedIndex ? 'bg-gray-100' : ''
                    }`}
                  >
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    </svg>
                    <span className="text-sm text-gray-900 truncate">{category.name}</span>
                    <span className="ml-auto text-xs text-gray-500 flex-shrink-0">Category</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* View All Results */}
          {!loading && query && (
            <div className="border-t border-gray-200">
              <button
                onClick={handleSearch}
                className="w-full px-4 py-3 text-sm text-amber-600 hover:bg-amber-50 font-medium flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                View all results for &quot;{query}&quot;
              </button>
            </div>
          )}
        </div>
      ) : showSuggestions && query.length >= 2 && !loading ? (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="px-4 py-8 text-center text-sm text-gray-500">
            No suggestions found for &quot;{query}&quot;
          </div>
          <div className="border-t border-gray-200">
            <button
              onClick={handleSearch}
              className="w-full px-4 py-3 text-sm text-amber-600 hover:bg-amber-50 font-medium"
            >
              Search for &quot;{query}&quot; anyway
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}