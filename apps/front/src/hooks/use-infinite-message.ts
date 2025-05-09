import { getMessages } from '@/services/chat-service';
import { tryCatch } from '@shrymp/utils';
import { useInfiniteQuery } from '@tanstack/react-query';

export const useInfiniteMessage = (chatId: string) => {
  const query = useInfiniteQuery({
    queryKey: ['chat-message', chatId],
    queryFn: async ({ pageParam }) => {
      const { data, error } = await tryCatch(
        getMessages({ chatId, pageParam }),
      );
      console.log(error);
      if (error) throw error;
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
  });
  return query;
};
