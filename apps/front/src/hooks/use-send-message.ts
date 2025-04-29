import { encryptAESKey, encryptMessage } from '@/lib/encryption';
import { arrayBufferToBase64, safeFetch } from '@/lib/utils';
import { $keys } from '@/stores/keys-store';
import { type AESKey } from '@shrymp/types';
import { useAtomValue } from 'jotai';
import { useParams } from 'react-router-dom';

export function useSendMessage() {
  const keys = useAtomValue($keys);
  const { chatId } = useParams();
  async function send(content: string) {
    if (!keys || !chatId) return;
    const { ciphertext, iv, aesKey } = await encryptMessage(content);
    const encryptedKeys: Record<string, AESKey> = {};

    for (const [k, v] of Object.entries(keys)) {
      const encryptedAESKey = await encryptAESKey(aesKey, v.key);
      encryptedKeys[k] = {
        encryptedAESKey: arrayBufferToBase64(encryptedAESKey),
        privateKeyVersion: v.privateKeyVersion,
      };
    }

    const { data, error } = await safeFetch(`/chat/${chatId}/message`, {
      method: 'POST',
      body: {
        chatId,
        encryptedContent: ciphertext,
        iv,
        keys: encryptedKeys,
      },
    });
    console.log(data, error);
  }

  return send;
}
