import { api } from '@/lib/api';
import { authClient } from '@/lib/auth';
import { db } from '@/lib/dexie/client-db';
import {
  PrivateKey,
  User,
  UserDecryptedPrivateKeyRuntime,
  UserPrivateKey,
} from '@shrymp/types';
import {
  decryptPrivateKey,
  encryptPrivateKey,
  generateRSAKeys,
} from './encryption-service';
import { arrayBufferToBase64, base64ToUint8Array } from '@/lib/utils';
import { tryCatch } from '@shrymp/utils';
import { getDefaultStore } from 'jotai';
import { $privateKeys } from '@/stores/keys-store';
import { $user } from '@/stores/user';

export const deleteLocalKeys = async (userId: User['id']) => {
  await db.privateKeys.where('userId').equals(userId).delete();
};

export const sendKeys = async (
  publicKey: string,
  privateKey: Omit<PrivateKey, 'version'>,
) => {
  return await api.post<{ version: number }>('/user/keys', {
    body: {
      publicKey,
      privateKey,
    },
  });
};

/**
 * Saving the base64 decryptedPrivateKey  to indexDB in order to get it back with auto-signin
 * without asking for the password
 */
export const saveLocalKeys = async (
  keys: {
    userId: string;
    privateKey: string;
    version: number;
  }[],
) => {
  await db.privateKeys.bulkAdd(keys);
};

/**
 * Generate a pair of key for the user and return the keys with the encryptedVersion with the user password to send to the backend
 */
export const generateNewKeys = async (user: User, password: string) => {
  const { publicKey, privateKey } = await generateRSAKeys();
  const encryptedPrivateKey = await encryptPrivateKey(
    new Uint8Array(privateKey),
    password,
  );
  return {
    publicKey,
    privateKey,
    encryptedPrivateKey,
  };
  // const { data, error } = await sendKeys(arrayBufferToBase64(publicKey), {
  //   encryptedKey: arrayBufferToBase64(
  //     encryptedPrivateKey.encryptedPrivateKey,
  //   ),
  //   iv: arrayBufferToBase64(encryptedPrivateKey.iv.buffer),
  //   salt: arrayBufferToBase64(encryptedPrivateKey.salt.buffer),
  // });
  // if (error) throw new Error('Error while saving the keys on the server');
  // user.publicKey = arrayBufferToBase64(publicKey);
  // user.keyVersion = data.version;
  // /**
  //  * Then we save localy the key
  //  */
  // const { error: localSaveError } = await tryCatch(saveLocalKey(
  //   user.id,
  //   arrayBufferToBase64(encryptedPrivateKey.encryptedPrivateKey),
  //   data.version,
  // ));
  // if (localSaveError) {
  //   throw new Error('Error while save the keys locally');
  // }
  // return privateKey;
};

/**
 * Get the encrypted keys saved in the database
 */
export const getPreviousKeys = async () => {
  return await api.get<UserPrivateKey[]>('/user/keys');
};

export const initKeys = async (password: string) => {
  const { data: authData, error: authError } = await authClient.getSession();
  if (authError) {
    console.error(authError);
    throw new Error(authError.message);
  }
  const user = authData.user;
  // Get key for index db
  const keys = await db.privateKeys
    .where('userId')
    .equals(user.id)
    .toArray();

  if (!user.publicKey || keys.length == 0) {
    //  We still delete every localKey related to the user just in case
    await deleteLocalKeys(user.id);
    const privateKey = await generateNewKeys(user, password);

    // And then we store the decryptedPrivateKey into the in memory store (jotai)
    const store = getDefaultStore();
    store.set($privateKeys, { 1: new Uint8Array(privateKey) });
    store.set($user, user);
    return;
  }

  /**
   * Mount to memory the keys in array buffer
   */
  const decryptedKeys: UserDecryptedPrivateKeyRuntime = {};
  for (const k of keys) {
    decryptedKeys[k.version] = base64ToUint8Array(k.privateKey);
  }
  const prevKeys = await getPreviousKeys(password);
  const store = getDefaultStore();
  store.set($privateKeys, { ...decryptedKeys, ...prevKeys });
  store.set($user, user);
};
