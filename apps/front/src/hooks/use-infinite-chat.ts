import { getChats } from '@/services/chat-service';
import { $newChats } from '@/stores/chat';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';

export function useInfiniteChat() {
  const newChats = useAtomValue($newChats);
  const query = useInfiniteQuery({
    queryKey: ['chats'],
    staleTime: Infinity,
    queryFn: async ({ pageParam }) => {
      return getChats(pageParam, newChats);
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
  });

  return query;
}
