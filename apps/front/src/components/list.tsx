import { cn } from '@/lib/utils';
import React from 'react';

export const List = ({
  children,
  className,
  onMaxScroll,
  order = 'down',
  ref,
  restoreScroll,
}: {
  children: React.ReactNode;
  className?: string;
  onMaxScroll: () => void;
  order: 'up' | 'down';
  ref: React.RefObject<HTMLDivElement | null>;
  restoreScroll: boolean;
}) => {
  const internalRef = React.useRef<HTMLDivElement | null>(null);
  React.useImperativeHandle(ref, () => internalRef.current!);

  const lastScrollHeight = React.useRef<number | null>(0);

  const restoreScrollFn = (el: HTMLDivElement) => {
    const prevScrollHeight = lastScrollHeight.current;
    const currentScrollHeight = el.scrollHeight;
    if (!prevScrollHeight) {
      lastScrollHeight.current = currentScrollHeight;
      return;
    }

    if (prevScrollHeight < currentScrollHeight) {
      el.scrollTo({ top: currentScrollHeight - prevScrollHeight });
    }
  };

  React.useLayoutEffect(() => {
    if (!internalRef.current || !restoreScroll) return;
    restoreScrollFn(internalRef.current);
  }, [restoreScroll]);

  React.useEffect(() => {
    const list = ref.current;
    if (!list) return;

    const checkMaxScroll = () => {
      if (!internalRef.current) return;
      const scrollHeight = internalRef.current.scrollHeight;

      const height = internalRef.current.getBoundingClientRect().height;
      const scrollTop = internalRef.current.scrollTop;
      if (order == 'down') {
        height == scrollHeight && onMaxScroll();
      }
      if (order == 'up') {
        lastScrollHeight.current = internalRef.current.scrollHeight;
        scrollTop == 0 && onMaxScroll();
      }
    };

    list.addEventListener('scroll', checkMaxScroll);
    return () => list.removeEventListener('scroll', checkMaxScroll);
  }, [onMaxScroll, order]);

  return (
    <div className={cn('flex flex-col', className)} ref={internalRef}>
      {children}
    </div>
  );
};
