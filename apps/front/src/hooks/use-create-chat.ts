import { queryClient } from '@/router';
import { createChat } from '@/services/chat-service';
import { ActivatedUser, Chat, PopulatedChat } from '@shrymp/types';
import { InfiniteData, useMutation } from '@tanstack/react-query';
import { MutationParams } from '.';

export function useCreateChat(
  { onSuccess, onError, onSettled }: MutationParams<
    { chatId: Chat['id']; users: ActivatedUser[] }
  >,
) {
  const mutation = useMutation({
    mutationKey: ['chats'],
    mutationFn: createChat,
    onMutate: async ({ chatId, users }) => {
      await queryClient.cancelQueries({ queryKey: ['chats'] });
      const prevData = queryClient.getQueryData<PopulatedChat[]>(['chats']);
      const chat = {
        createdAt: new Date(),
        updatedAt: new Date(),
        id: chatId,
        messages: [],
        users: users,
      };
      queryClient.setQueryData<
        InfiniteData<{ chats: PopulatedChat[]; nextCursor: number }>
      >(
        ['chats'],
        (old) => {
          if (!old) return old;
          const lastPageIndex = old.pages.length - 1;
          const lastPage = old.pages[lastPageIndex];

          const updatedLastPage = {
            ...lastPage,
            chats: [chat],
          };

          const updatedPages = old.pages.map((page, index) =>
            index === lastPageIndex ? updatedLastPage : page
          );

          return {
            ...old,
            pages: updatedPages,
          };
        },
      );
      return { prevData };
    },
    onError: (error, data, prev) => {
      onError && onError(error, data);
      if (!prev || !prev.prevData) return;

      queryClient.setQueryData<PopulatedChat[]>(['chats'], prev.prevData);
    },
    onSuccess: (_, values) => {
      onSuccess && onSuccess(values);
      // setIsOpen(false);
      // setSelectedUsers([]);
      // navigate(`/chats/${values.chatId}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      onSettled && onSettled();
    },
  });

  return mutation;
}
