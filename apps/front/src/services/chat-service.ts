import { api } from '@/lib/api';
import { $currentChatUsers, $privateKeys } from '@/stores/keys-store';
import { $user } from '@/stores/user';
import {
  AESKey,
  DecryptedMessage,
  Message,
  PopulatedChat,
  User,
  UserDecryptedPrivateKeyRuntime,
} from '@shrymp/types';
import { getDefaultStore } from 'jotai';
import {
  decryptAESKey,
  decryptString,
  encryptAESKey,
  encryptMessage,
} from './encryption-service';
import { arrayBufferToBase64, base64ToUint8Array } from '@/lib/utils';
import { privateKey } from '../../../back/src/libs/db/schema';

export async function createChat(
  { users, chatId }: { users: User[]; chatId: string },
) {
  const { error } = await api.post('/chats', {
    body: { userIds: users.map((u) => u.id), chatId },
  });

  console.error(error);

  if (error) throw new Error(error.message);
}

export const getChats = async () => {
  const { data, error } = await api.get<PopulatedChat[]>('/chats');

  if (data) {
    return data;
  }
  throw error;
};

export const sendMessage = async (content: string, chatId: string) => {
  const store = getDefaultStore();
  const currentChatUsers = store.get($currentChatUsers);
  if (!currentChatUsers) throw new Error('No keys to encrypt');
  const user = store.get($user);
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
};

export const getMessages = async (
  { chatId, pageParam = 0 }: { chatId: string; pageParam: number },
) => {
  const store = getDefaultStore();

  const user = store.get($user);
  if (!user) throw new Error('Unauthorized');

  const privateKeys = store.get($privateKeys);
  if (!privateKeys) throw new Error('No private keys detected');

  const { data, error } = await api.get<
    { messages: Message[]; nextCursor: number }
  >(
    `chats/${chatId}/messages?cursor=${pageParam}`,
  );
  if (error) throw new Error(error.message);

  const decryptedMessages: DecryptedMessage[] = [];
  for (const message of data.messages) {
    const decryptedContent = await decryptMessage(message, user, privateKeys);
    decryptedMessages.push({
      content: decryptedContent,
      userId: message.userId,
      id: message.id,
      createdAt: new Date(message.createdAt),
      updatedAt: new Date(message.updatedAt),
    });
  }
  return { decryptedMessages, nextCursor: data.nextCursor };
};

export const decryptMessage = async (
  message: Message,
  user: User,
  privateKeys: UserDecryptedPrivateKeyRuntime,
) => {
  const userKey = message.keys[user.id];
  const relatedPrivateKey = privateKeys[userKey.privateKeyVersion];

  if (!relatedPrivateKey) {
    throw new Error('Unkown private key');
  }
  const decryptedAESKey = await decryptAESKey(
    base64ToUint8Array(userKey.encryptedAESKey),
    new Uint8Array(relatedPrivateKey),
  );
  return await decryptString(
    decryptedAESKey,
    base64ToUint8Array(message.encryptedContent),
    base64ToUint8Array(message.iv),
  );
};
