// To help user add, remove or edit tags when creating/editing a job

import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function TagInput({ value = [], onChange }) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !value.includes(newTag)) {
        onChange([...value, newTag]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-foreground/80 mb-1">Tags</label>
      <div className="flex flex-wrap items-center gap-2 p-2 bg-muted border border-secondary rounded-md focus-within:ring-2 focus-within:ring-accent">
        {value.map((tag, index) => (
          <span key={index} className="flex items-center bg-primary text-accent-foreground text-sm font-medium px-2.5 py-1 rounded-full">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-2 text-accent-foreground/70 hover:text-accent-foreground"
              aria-label={`Remove ${tag}`}
            >
              <X size={14} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a tag..."
          className="bg-transparent flex-grow focus:outline-none text-foreground p-1"
        />
      </div>
    </div>
  );
}