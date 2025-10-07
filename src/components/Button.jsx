import React from 'react';

export default function Button({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary', 
  ...props 
}) {
  const baseStyles = [
    'px-4 py-2 rounded-md font-semibold text-sm transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'inline-flex items-center justify-center', // Added for better icon alignment
  ].join(' ');
  
  const variants = {
    primary: 'bg-primary text-accent-foreground hover:bg-primary/90 focus:ring-primary',
    secondary: 'bg-secondary text-foreground hover:bg-muted focus:ring-secondary',
  };

  const className = `${baseStyles} ${variants[variant]}`;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}