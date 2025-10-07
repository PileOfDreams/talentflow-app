// Used for rendering suggestions to the user when they use '@' while adding a note to a candidate's timeline

import React from 'react';
import ReactDOM from 'react-dom';

export default function MentionSuggestions({ suggestions, onSelect, position }) {
  if (!suggestions || suggestions.length === 0 || !position) {
    return null;
  }

  const suggestionsJsx = (
    <div
      className="fixed z-50 w-48 bg-secondary border border-muted rounded-md shadow-lg"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      <ul className="max-h-40 overflow-auto p-1">
        {suggestions.map((user) => (
          <li
            key={user.id}
            onClick={() => onSelect(user.username)}
            className="p-2 rounded-md hover:bg-primary cursor-pointer text-sm text-foreground"
          >
            {user.name} (@{user.username})
          </li>
        ))}
      </ul>
    </div>
  );

  return ReactDOM.createPortal(suggestionsJsx, document.getElementById('portal-root'));
}