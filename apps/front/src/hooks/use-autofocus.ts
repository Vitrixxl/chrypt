import React from 'react';

export function useAutoFocus(ref: React.RefObject<HTMLElement | null>) {
  const isInputOrTextareaFocused = () => {
    const active = document.activeElement;
    return (
      active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')
    );
  };

  const handleKeyDown = () => {
    !isInputOrTextareaFocused() && ref.current && ref.current.focus();
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [ref]);
}
