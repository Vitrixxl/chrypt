import { decryptPrivateKey } from '@/lib/encryption';
import { base64ToArrayBuffer } from '@/lib/utils';
import { PrivateKey } from '@shrymp/types';

export function useDecodeUserKeys() {
  return async (keys: PrivateKey[], passphrase: string) => {
    const privateKeysWithDecryptedKey: PrivateKey[] = [];
    for (const privateKey of keys) {
      const decryptedKey = await decryptPrivateKey(
        passphrase,
        base64ToArrayBuffer(privateKey.key),
        base64ToArrayBuffer(privateKey.salt),
        base64ToArrayBuffer(privateKey.iv),
      );
      privateKeysWithDecryptedKey.push({
        ...privateKey,
        decryptedKey,
      });
    }
    return privateKeysWithDecryptedKey;
  };
}
