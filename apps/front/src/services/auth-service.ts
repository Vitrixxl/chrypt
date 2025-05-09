import { authClient } from '@/lib/auth';
import {
  createKeys,
  encryptPrivateKey,
  generateRSAKeys,
} from './encryption-service';
import { deleteLocalKeys, saveLocalKey, sendKeys } from './key-service';
import { arrayBufferToBase64 } from '@/lib/utils';
import { tryCatch } from '@shrymp/utils';
import { getDefaultStore } from 'jotai';
import { $privateKeys } from '@/stores/keys-store';

export const register = () => {
};

export const login = async (password: string) => {
  const { data: authData, error: authError } = await authClient.getSession();
  if (authError) {
    console.error(authError);
    throw new Error(authError.message);
  }
  const user = authData.user;
  if (!user.publicKey) {
    /**
     * We still delete every localKey related to the user just in case
     */
    await deleteLocalKeys(user.id);
    const { publicKey, privateKey } = await generateRSAKeys();
    const encryptedPrivateKey = await encryptPrivateKey(privateKey, password);
    const { error } = await sendKeys(publicKey, {
      encryptedKey: arrayBufferToBase64(
        encryptedPrivateKey.encryptedPrivateKey,
      ),
      iv: arrayBufferToBase64(encryptedPrivateKey.iv.buffer),
      salt: arrayBufferToBase64(encryptedPrivateKey.salt.buffer),
      version: 1,
    });
    if (error) throw new Error('Error while saving the keys on the server');
    user.publicKey = publicKey;
    user.publicKeyVersion = 1;
    /**
     * Then we save localy the key
     */
    const { error: localSaveError } = await tryCatch(saveLocalKey(
      user.id,
      arrayBufferToBase64(encryptedPrivateKey.encryptedPrivateKey),
      1,
    ));
    if (localSaveError) {
      throw new Error('Error while save the keys locally');
    }

    // And then we store the decryptedPrivateKey into the in memory store (jotai)
    const store = getDefaultStore();
    store.set($privateKeys, { 1: privateKey });
  }
};
