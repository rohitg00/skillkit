import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  onClick?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export function Card({
  children,
  className = '',
  noPadding = false,
  onClick,
  onDragOver,
  onDragLeave,
  onDrop
}: CardProps): React.ReactElement {
  const paddingClass = noPadding ? '' : 'p-6';
  const clickableClass = onClick ? 'cursor-pointer' : '';

  function handleKeyDown(e: React.KeyboardEvent): void {
    if (!onClick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      if (e.key === ' ') {
        e.preventDefault();
      }
      onClick();
    }
  }

  return (
    <div
      className={`relative bg-black border border-zinc-800 transition-colors duration-300 ${paddingClass} ${clickableClass} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {children}
    </div>
  );
}