import { cn } from '@/lib/utils';
import React from 'react';

export const List = ({
  children,
  className,
  onMaxScroll,
  order = 'down',
  ref,
}: {
  children: React.ReactNode;
  className?: string;
  onMaxScroll: () => void;
  order: 'up' | 'down';
  ref: React.RefObject<HTMLDivElement | null>;
}) => {
  const internalRef = React.useRef<HTMLDivElement | null>(null);
  React.useImperativeHandle(ref, () => internalRef.current!);

  const lastScrollTop = React.useRef<number>(0);
  const lastScrollHeight = React.useRef<number>(0);

  // Restore scroll position after DOM updates
  React.useLayoutEffect(() => {
    const container = internalRef.current;
    if (!container) return;

    const newScrollHeight = container.scrollHeight;
    const scrollDelta = newScrollHeight - lastScrollHeight.current;
    container.scrollTop = lastScrollTop.current + scrollDelta;
  }, [children]);

  // Infinite scroll trigger
  React.useEffect(() => {
    const container = internalRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.getBoundingClientRect().height;
      lastScrollTop.current = scrollTop;
      lastScrollHeight.current = scrollHeight;

      if (order === 'down' && scrollTop + clientHeight >= scrollHeight) {
        onMaxScroll();
      } else if (order === 'up' && scrollTop === 0) {
        onMaxScroll();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [onMaxScroll, order]);

  return (
    <div className={cn('flex flex-col', className)} ref={internalRef}>
      {children}
    </div>
  );
};
