import { MainLoader } from '@/components/main-loader';
import { authClient } from '@/lib/auth';
import { db } from '@/lib/dexie/client-db';
import { ClientSocket } from '@/lib/socket';
import { base64ToUint8Array } from '@/lib/utils';
import { queryClient } from '@/router';
import { decryptMessage } from '@/services/chat-service';
import { initSession } from '@/services/init-service';
import { $privateKeys } from '@/stores/keys-store';
import { $user } from '@/stores/user';
import {
  DecryptedMessage,
  PopulatedChat,
  UserDecryptedPrivateKeyRuntime,
} from '@shrymp/types';
import { InfiniteData } from '@tanstack/react-query';
import { getDefaultStore, useAtomValue, useSetAtom } from 'jotai';
import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { $currentChatNewMessages, $newMessageTrigger } from '@/stores/chat';

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = React.useState(true);
  const setNewMessageTrigger = useSetAtom($newMessageTrigger);
  const setCurrentChatNewMessages = useSetAtom($currentChatNewMessages);
  const user = useAtomValue($user);

  const setup = async () => {
    const { data: authData, error: authError } = await authClient.getSession();
    if (authError || !authData) {
      if (!location.pathname.includes('auth')) navigate('/auth/login');
      setIsLoading(false);
      return;
    }

    /**
     * Get the keys from the index DB
     */
    const keys = await db.privateKeys
      .where('userId')
      .equals(authData.user.id)
      .toArray();

    /**
     * Redirect if we don't find any keys
     */
    if (keys.length == 0) {
      navigate('/auth/login');
      setIsLoading(false);
      return;
    }

    /**
     * Mount to memory the keys in array buffer
     */
    const decryptedKeys: UserDecryptedPrivateKeyRuntime = {};
    for (const k of keys) {
      decryptedKeys[k.version] = base64ToUint8Array(k.privateKey);
    }

    initSession(authData.user, decryptedKeys);

    setIsLoading(false);
    if (!location.pathname.includes('/chats')) {
      navigate('/chats');
    }
  };

  const setupSocket = () => {
    const ws = new ClientSocket(
      new WebSocket(
        new URL('/api/socket/connect', import.meta.env.VITE_BASE_API_URL_WS),
      ),
    );
    ws.on('new-chat', (data) => {
      const chat = {
        createdAt: new Date(),
        updatedAt: new Date(),
        id: data.chatId,
        messages: [],
        users: data.users,
      };
      queryClient.setQueryData<PopulatedChat[]>(
        ['chats'],
        (old) => old ? [chat, ...old] : [chat],
      );
    });

    ws.on('new-message', async (data) => {
      const store = getDefaultStore();
      const user = store.get($user);
      const privateKeys = store.get($privateKeys);
      if (!user || !privateKeys) return;

      const decryptedContent = await decryptMessage(
        data.message,
        user,
        privateKeys,
      );

      queryClient.setQueryData<
        InfiniteData<{
          decryptedMessages: DecryptedMessage[];
          nextCursor: number;
        }>
      >(['chat-message', data.chatId], (old) => {
        if (!old) return old;

        const lastPageIndex = old.pages.length - 1;
        const lastPage = old.pages[lastPageIndex];

        const updatedLastPage = {
          ...lastPage,
          decryptedMessages: [...lastPage.decryptedMessages, {
            content: decryptedContent,
            userId: data.message.userId,
            id: data.message.id,
            createdAt: new Date(data.message.createdAt),
            updatedAt: new Date(data.message.updatedAt),
          }],
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
        [data.chatId]: prev[data.chatId] ? prev[data.chatId] + 1 : 1,
      }));
    });
  };

  React.useEffect(() => {
    if (user) return;
    setup();
    setupSocket();
  }, [user]);

  if (isLoading) {
    return <MainLoader />;
  }

  return <Outlet />;
}
