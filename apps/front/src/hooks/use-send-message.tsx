import { api } from '@/lib/api';
import { v4 as uuid } from 'uuid';
import { arrayBufferToBase64, base64ToUint8Array } from '@/lib/utils';
import { queryClient } from '@/router';
import { encryptAESKey, encryptMessage } from '@/services/encryption-service';
import { $currentChatUsers } from '@/stores/keys-store';
import { $user } from '@/stores/user';
import { AESKey, DecryptedMessage } from '@shrymp/types';
import { InfiniteData, useMutation } from '@tanstack/react-query';
import { useAtomValue, useSetAtom } from 'jotai';
import { $currentChatNewMessages, $newMessageTrigger } from '@/stores/chat';

export const useSendMessage = () => {
  const user = useAtomValue($user);
  const currentChatUsers = useAtomValue($currentChatUsers);
  const setNewMessageTrigger = useSetAtom($newMessageTrigger);
  const setCurrentChatNewMessages = useSetAtom($currentChatNewMessages);
  const mutation = useMutation({
    mutationKey: ['send-message'],
    mutationFn: async ({
      content,
      chatId,
    }: { content: string; chatId: string }) => {
      if (!currentChatUsers) throw new Error('No keys to encrypt');
      if (!user) throw new Error('Not connected');
      const { ciphertext, iv, aesKey } = await encryptMessage(content);
      const base64Content = arrayBufferToBase64(ciphertext);
      const base64Iv = arrayBufferToBase64(iv.buffer);
      const encryptedKeys: Record<string, AESKey> = {};

      for (const [k, v] of Object.entries(currentChatUsers)) {
        const encryptedAESKey = await encryptAESKey(
          aesKey,
          base64ToUint8Array(v.publicKey),
        );
        encryptedKeys[k] = {
          encryptedAESKey: arrayBufferToBase64(encryptedAESKey),
          privateKeyVersion: v.keyVersion,
        };
      }
      await api.post(`/chats/${chatId}/message`, {
        body: {
          chatId,
          encryptedContent: base64Content,
          iv: base64Iv,
          keys: encryptedKeys,
        },
      });
    },
    onMutate: ({ content, chatId }) => {
      if (!user) {
        console.log('no user');
        return;
      }

      const message: DecryptedMessage = {
        id: uuid(),
        content,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      queryClient.setQueryData<
        InfiniteData<{
          decryptedMessages: DecryptedMessage[];
          nextCursor: number;
        }>
      >(['chat-message', chatId], (old) => {
        if (!old) return old;

        const lastPageIndex = old.pages.length - 1;
        const lastPage = old.pages[lastPageIndex];

        const updatedLastPage = {
          ...lastPage,
          decryptedMessages: [...lastPage.decryptedMessages, message],
        };

        const updatedPages = old.pages.map((page, index) =>
          index === lastPageIndex ? updatedLastPage : page
        );

        return {
          ...old,
          pages: updatedPages,
        };
      });
      setNewMessageTrigger(true);
      setCurrentChatNewMessages((prev) => ({
        ...prev,
        [chatId]: prev[chatId] ? prev[chatId] + 1 : 1,
      }));
    },
  });

  return mutation;
};
