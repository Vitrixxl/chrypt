import { getMessages } from '@/services/chat-service';
import { tryCatch } from '@shrymp/utils';
import { useInfiniteQuery } from '@tanstack/react-query';

export const useInfiniteMessage = (chatId: string) => {
  const query = useInfiniteQuery({
    queryKey: ['chat-message', chatId],
    staleTime: Infinity,
    queryFn: async ({ pageParam }) => {
      return getMessages({ chatId, pageParam });
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
  });
  return query;
};
