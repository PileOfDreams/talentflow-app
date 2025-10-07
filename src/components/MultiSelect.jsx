// Used to create a drop-down menu that supports multi-select, like when filtering jobs by tags

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, X } from 'lucide-react';

export default function MultiSelect({ 
  options, 
  selected, 
  onChange, 
  placeholder = "Select tags..." 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <div className="relative w-full sm:w-64" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full bg-muted text-foreground rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
      >
        <span className="truncate">
          {selected.length > 0 ? `${selected.length} tag(s) selected` : placeholder}
        </span>
        <div className="flex items-center">
          {selected.length > 0 && (
            <X 
              onClick={clearSelection} 
              className="w-4 h-4 mr-2 text-foreground/50 hover:text-foreground transition-colors" 
              aria-label="Clear selection"
            />
          )}
          <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-secondary border border-muted rounded-md shadow-lg">
          <ul className="max-h-60 overflow-auto p-2">
            {options.map((option) => (
              <li
                key={option}
                onClick={() => handleSelect(option)}
                className="flex items-center p-2 rounded-md hover:bg-muted cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  readOnly
                  className="mr-3 h-4 w-4 rounded text-primary focus:ring-accent"
                />
                <span className="text-sm text-foreground">{option}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}