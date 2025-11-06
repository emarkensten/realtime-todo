"use client"

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { searchGroceries, type GroceryItem } from '@/lib/groceryData';

interface GroceryAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectSuggestion: (suggestion: string) => void;
  placeholder?: string;
  className?: string;
}

export function GroceryAutocomplete({
  value,
  onChange,
  onSelectSuggestion,
  placeholder,
  className
}: GroceryAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<GroceryItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [ghostText, setGhostText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.length >= 2) {
      const results = searchGroceries(value, 5);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);

      // Set ghost text for the top suggestion
      if (results.length > 0) {
        const topSuggestion = results[0].name;
        if (topSuggestion.toLowerCase().startsWith(value.toLowerCase())) {
          setGhostText(topSuggestion);
        } else {
          setGhostText('');
        }
      } else {
        setGhostText('');
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setGhostText('');
    }
  }, [value]);

  const handleSelectSuggestion = (suggestion: GroceryItem) => {
    onSelectSuggestion(suggestion.name);
    setShowSuggestions(false);
    setGhostText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Tab or Right Arrow - accept ghost text
    if ((e.key === 'Tab' || e.key === 'ArrowRight') && ghostText) {
      e.preventDefault();
      onSelectSuggestion(ghostText);
      setGhostText('');
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative flex-1">
      {/* Ghost text overlay */}
      {ghostText && value && (
        <div
          className="absolute inset-0 pointer-events-none flex items-center px-4 h-14"
          style={{ zIndex: 1 }}
        >
          <span className="text-base text-transparent">
            {value}
          </span>
          <span className="text-base text-gray-400">
            {ghostText.slice(value.length)}
          </span>
        </div>
      )}

      {/* Actual input */}
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className={`h-14 text-base px-4 relative ${className}`}
        style={{ zIndex: 2, backgroundColor: 'transparent' }}
        enterKeyHint="done"
        autoComplete="off"
      />

      {/* Suggestions dropdown (grows upward) */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute left-0 right-0 bottom-full mb-2 bg-white dark:bg-gray-800 border rounded-lg shadow-xl max-h-60 overflow-y-auto"
          style={{ zIndex: 50 }}
        >
          {suggestions.map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectSuggestion(item)}
              className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between border-b last:border-b-0"
            >
              <span className="font-medium text-base">{item.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {item.category}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
