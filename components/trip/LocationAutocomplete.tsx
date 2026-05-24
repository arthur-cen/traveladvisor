'use client';

import { useState, useEffect, useRef, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import type { GeoPoint } from '@/lib/types';

interface Suggestion {
  id: string;
  placeName: string;
  primaryText: string;
  secondaryText: string;
  center: [number, number];
}

interface Props {
  id: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onSelect: (point: GeoPoint) => void;
  onBlur?: () => void;
  required?: boolean;
  'aria-required'?: 'true' | 'false';
}

const DEBOUNCE_MS = 300;

export default function LocationAutocomplete({
  id,
  value,
  placeholder,
  onChange,
  onSelect,
  onBlur,
  required,
  'aria-required': ariaRequired,
}: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [mounted, setMounted] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const listboxId = useId();
  const getOptionId = (i: number) => `${listboxId}-opt-${i}`;

  // Mount guard for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Position dropdown under the input
  const updateDropdownPosition = useCallback(() => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: 'fixed',
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 9000,
    });
  }, []);

  // Fetch suggestions
  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    // Cancel previous in-flight request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);

    try {
      const res = await fetch(
        `/api/geocode/suggest?q=${encodeURIComponent(q)}`,
        { signal: abortRef.current.signal }
      );
      const data = await res.json();
      const results: Suggestion[] = data.suggestions ?? [];
      setSuggestions(results);
      setIsOpen(true);
      setActiveIndex(-1);
      updateDropdownPosition();
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setSuggestions([]);
        setIsOpen(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, [updateDropdownPosition]);

  // Debounced input handler
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    onChange(q);
    setActiveIndex(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(q), DEBOUNCE_MS);
  }

  // Reposition on scroll/resize while open
  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('scroll', updateDropdownPosition, true);
    window.addEventListener('resize', updateDropdownPosition);
    return () => {
      window.removeEventListener('scroll', updateDropdownPosition, true);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [isOpen, updateDropdownPosition]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handlePointerDown(e: PointerEvent) {
      if (
        wrapperRef.current?.contains(e.target as Node) ||
        listboxRef.current?.contains(e.target as Node)
      ) return;
      setIsOpen(false);
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  function handleSelect(suggestion: Suggestion) {
    onChange(suggestion.placeName);
    setSuggestions([]);
    setIsOpen(false);
    setActiveIndex(-1);
    onSelect({
      lat: suggestion.center[1],
      lng: suggestion.center[0],
      placeName: suggestion.placeName,
    });
    inputRef.current?.blur();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        e.preventDefault();
        handleSelect(suggestions[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }

  function handleBlur() {
    // Delay so click on suggestion can fire first
    setTimeout(() => {
      if (!listboxRef.current?.matches(':focus-within')) {
        setIsOpen(false);
        onBlur?.();
      }
    }, 150);
  }

  const dropdown = isOpen && mounted ? createPortal(
    <ul
      ref={listboxRef}
      id={listboxId}
      role="listbox"
      aria-label="Location suggestions"
      className="autocomplete-dropdown"
      style={dropdownStyle}
    >
      {suggestions.length === 0 && !isLoading && (
        <li className="autocomplete-empty" role="option" aria-selected="false">
          No locations found
        </li>
      )}
      {suggestions.map((s, i) => (
        <li
          key={s.id}
          id={getOptionId(i)}
          role="option"
          aria-selected={i === activeIndex}
          className={`autocomplete-option${i === activeIndex ? ' is-active' : ''}`}
          onPointerDown={(e) => {
            // Prevent blur from firing before click
            e.preventDefault();
            handleSelect(s);
          }}
        >
          <span className="autocomplete-option__pin" aria-hidden="true">◎</span>
          <span className="autocomplete-option__text">
            <span className="autocomplete-option__primary">{s.primaryText}</span>
            {s.secondaryText && (
              <span className="autocomplete-option__secondary">{s.secondaryText}</span>
            )}
          </span>
        </li>
      ))}
    </ul>,
    document.body
  ) : null;

  return (
    <div ref={wrapperRef} className={`autocomplete-wrapper${isLoading ? ' is-loading' : ''}`}>
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        required={required}
        aria-required={ariaRequired}
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={isOpen ? listboxId : undefined}
        aria-activedescendant={activeIndex >= 0 ? getOptionId(activeIndex) : undefined}
        role="combobox"
        autoComplete="off"
        spellCheck={false}
        className="exp-input"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      />
      {isLoading && (
        <span className="autocomplete-spinner" aria-hidden="true" />
      )}
      {dropdown}
    </div>
  );
}
