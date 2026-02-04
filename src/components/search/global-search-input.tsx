'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, Clock, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface SearchSuggestion {
  query: string;
  timestamp: number;
}

interface GlobalSearchInputProps {
  onSearch: (query: string, filters?: Record<string, unknown>) => void;
  placeholder?: string;
  className?: string;
}

const MAX_RECENT_SEARCHES = 5;
const RECENT_SEARCHES_KEY = 'airm_recent_searches';

export function GlobalSearchInput({
  onSearch,
  placeholder = 'Search AI systems, assessments, risks...',
  className = '',
}: GlobalSearchInputProps) {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, unknown>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SearchSuggestion[];
        // Filter out searches older than 7 days
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const recent = parsed.filter((s) => s.timestamp > weekAgo);
        setRecentSearches(recent);
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  }, []);

  // Save to recent searches
  const saveToRecentSearches = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setRecentSearches((prev) => {
      // Remove duplicate if exists
      const filtered = prev.filter((s) => s.query !== searchQuery);

      // Add new search at the beginning
      const updated = [
        { query: searchQuery, timestamp: Date.now() },
        ...filtered,
      ].slice(0, MAX_RECENT_SEARCHES);

      // Save to localStorage
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save recent searches:', error);
      }

      return updated;
    });
  }, []);

  // Handle search with debounce
  const handleSearchDebounced = useCallback(
    (searchQuery: string) => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        if (searchQuery.trim()) {
          onSearch(searchQuery, selectedFilters);
          saveToRecentSearches(searchQuery);
        }
      }, 300); // 300ms debounce
    },
    [onSearch, selectedFilters, saveToRecentSearches]
  );

  // Handle input change
  const handleInputChange = (value: string) => {
    setQuery(value);
    if (value.trim()) {
      handleSearchDebounced(value);
    }
  };

  // Handle search submit (Enter key)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      onSearch(query, selectedFilters);
      saveToRecentSearches(query);
      setShowSuggestions(false);
    }
  };

  // Handle recent search click
  const handleRecentSearchClick = (searchQuery: string) => {
    setQuery(searchQuery);
    onSearch(searchQuery, selectedFilters);
    setShowSuggestions(false);
  };

  // Clear search
  const handleClear = () => {
    setQuery('');
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
  };

  // Clear all recent searches
  const handleClearRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (error) {
      console.error('Failed to clear recent searches:', error);
    }
  };

  // Toggle filter
  const toggleFilter = (key: string, value: unknown) => {
    setSelectedFilters((prev) => {
      const updated = { ...prev };
      if (updated[key] === value) {
        delete updated[key];
      } else {
        updated[key] = value;
      }
      return updated;
    });
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            className="pl-9 pr-9"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Quick Filters */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="relative"
            >
              <Filter className="h-4 w-4" />
              {Object.keys(selectedFilters).length > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
                >
                  {Object.keys(selectedFilters).length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Entity Type</h4>
                <div className="flex flex-wrap gap-2">
                  {['ai_system', 'assessment', 'risk', 'evidence'].map((type) => (
                    <Badge
                      key={type}
                      variant={selectedFilters.entityType === type ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleFilter('entityType', type)}
                    >
                      {type.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              {Object.keys(selectedFilters).length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFilters({})}
                  className="w-full"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <Button type="submit" disabled={!query.trim()}>
          Search
        </Button>
      </form>

      {/* Recent Searches Suggestions */}
      {showSuggestions && recentSearches.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-md border bg-popover p-2 text-popover-foreground shadow-md">
          <div className="flex items-center justify-between mb-2 px-2">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Recent Searches
            </span>
            <button
              type="button"
              onClick={handleClearRecent}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>
          <div className="space-y-1">
            {recentSearches.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleRecentSearchClick(suggestion.query)}
                className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent hover:text-accent-foreground"
              >
                {suggestion.query}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
