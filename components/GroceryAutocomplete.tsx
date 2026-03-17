"use client"

import { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { searchGroceries, type GroceryItem } from '@/lib/groceryData';

interface GroceryAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectSuggestion: (suggestion: string, category?: string) => void;
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
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.length >= 2) {
      const results = searchGroceries(value, 5);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setHighlightedIndex(-1);

      if (results.length > 0) {
        const topSuggestion = results[0].name;
        setGhostText(
          topSuggestion.toLowerCase().startsWith(value.toLowerCase())
            ? topSuggestion
            : ''
        );
      } else {
        setGhostText('');
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setGhostText('');
    }
  }, [value]);

  // Click-outside handler
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const extractQuantityAndUnit = (input: string): { quantity: string; unit: string } | null => {
    const trimmed = input.trim();
    const match = trimmed.match(/^(\d+[,.]?\d*|\d+-\d+|en|ett|två|tre|fyra|fem|sex|sju|åtta|nio|tio)\s*([a-zåäö]+)?\s+/i);
    if (match) {
      return { quantity: match[1], unit: match[2] || '' };
    }
    return null;
  };

  const buildFullText = useCallback((name: string): string => {
    const quantityUnit = extractQuantityAndUnit(value);
    if (quantityUnit) {
      return `${quantityUnit.quantity}${quantityUnit.unit ? ' ' + quantityUnit.unit : ''} ${name}`;
    }
    return name;
  }, [value]);

  const handleSelectSuggestion = (suggestion: GroceryItem) => {
    onSelectSuggestion(buildFullText(suggestion.name), suggestion.category);
    setShowSuggestions(false);
    setGhostText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        return;
      }
      if (e.key === 'Enter' && highlightedIndex >= 0) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[highlightedIndex]);
        return;
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        return;
      }
    }

    // Tab or Right Arrow — accept ghost text
    if ((e.key === 'Tab' || e.key === 'ArrowRight') && ghostText) {
      e.preventDefault();
      const topSuggestion = suggestions[0];
      onSelectSuggestion(buildFullText(ghostText), topSuggestion?.category);
      setGhostText('');
      setShowSuggestions(false);
    }
  };

  return (
    <div ref={containerRef} className="relative flex-1">
      {/* Ghost text overlay */}
      {ghostText && value && (
        <div
          className="absolute inset-0 pointer-events-none flex items-center px-4 h-14"
          style={{ zIndex: 1 }}
        >
          <span className="text-base text-transparent">{value}</span>
          <span className="text-base text-gray-400">
            {ghostText.slice(value.length)}
          </span>
        </div>
      )}

      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className={`h-14 text-base px-4 relative !bg-transparent ${className}`}
        style={{ zIndex: 2 }}
        enterKeyHint="done"
        autoComplete="off"
        role="combobox"
        aria-expanded={showSuggestions}
        aria-autocomplete="list"
        aria-controls="grocery-suggestions"
        aria-label="Lägg till vara"
      />

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          id="grocery-suggestions"
          role="listbox"
          aria-label="Förslag"
          onMouseDown={(e) => e.preventDefault()}
          className="absolute left-0 right-0 bottom-full mb-2 bg-white dark:bg-gray-800 border rounded-lg shadow-xl max-h-60 overflow-y-auto"
          style={{ zIndex: 50 }}
        >
          {suggestions.map((item, index) => (
            <button
              key={index}
              type="button"
              role="option"
              aria-selected={index === highlightedIndex}
              onClick={() => handleSelectSuggestion(item)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between border-b last:border-b-0 ${
                index === highlightedIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
              }`}
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
