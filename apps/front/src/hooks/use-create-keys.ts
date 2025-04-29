import { generateRSAKeys } from '@/lib/encryption';
import { safeFetch } from '@/lib/utils';

export function useCreateKeys() {
  return async (password: string) => {
    const { publicKey, privateKey } = await generateRSAKeys(password);
    await safeFetch<{ message: string }>(
      '/user/keys',
      {
        method: 'POST',
        body: {
          publicKey,
          privateKey: {
            iv: privateKey.iv,
            salt: privateKey.salt,
            key: privateKey.key,
            version: 1,
          },
        },
      },
    );
    return { publicKey, privateKey };
  };
}
