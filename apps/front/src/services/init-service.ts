import { authClient } from '@/lib/auth';
import {
  deleteLocalKeys,
  generateNewKeys,
  getPreviousKeys,
  saveLocalKeys,
  sendKeys,
} from './key-service';
import { arrayBufferToBase64, base64ToUint8Array } from '@/lib/utils';
import { tryCatch } from '@shrymp/utils';
import { User, UserDecryptedPrivateKeyRuntime } from '@shrymp/types';
import { decryptPrivateKey } from './encryption-service';
import { getDefaultStore } from 'jotai';
import { $privateKeys } from '@/stores/keys-store';
import { $user } from '@/stores/user';

export const initSession = (
  user: User,
  runTimeKeys: UserDecryptedPrivateKeyRuntime,
) => {
  const store = getDefaultStore();
  store.set($user, user);
  store.set($privateKeys, runTimeKeys);
};
export const initAccount = async (password: string, user: User) => {
  const {
    publicKey,
    privateKey,
    encryptedPrivateKey,
  } = await generateNewKeys(user, password);
  const { data, error } = await sendKeys(arrayBufferToBase64(publicKey), {
    encryptedKey: arrayBufferToBase64(
      encryptedPrivateKey.encryptedPrivateKey,
    ),
    iv: arrayBufferToBase64(encryptedPrivateKey.iv.buffer),
    salt: arrayBufferToBase64(encryptedPrivateKey.salt.buffer),
  });
  if (error) throw new Error('Error while saving the keys on the server');

  const { error: localSaveError } = await tryCatch(saveLocalKeys([{
    privateKey: arrayBufferToBase64(privateKey),
    userId: user.id,
    version: data.version,
  }]));

  if (localSaveError) {
    throw new Error('Error while saving the keys localy');
  }

  initSession({
    ...user,
    publicKey: arrayBufferToBase64(publicKey),
    keyVersion: data.version,
  }, {
    [data.version]: new Uint8Array(privateKey),
  });
};

export const afterAuthHandler = async (password: string) => {
  const { data: authData, error: authError } = await authClient.getSession();
  if (authError) {
    console.error(authError);
    throw new Error(authError.message);
  }
  const user = authData.user;
  if (!user.publicKey) {
    await initAccount(password, user);
    return;
  }

  const { data: prevKeys, error: prevKeysError } = await getPreviousKeys();
  if (prevKeysError) {
    console.error(prevKeysError);
    throw new Error('Error while retrieving previous keys');
  }

  // We delete the previous keys in order to put the sync ones
  await deleteLocalKeys(user.id);

  const decryptedKeys: UserDecryptedPrivateKeyRuntime = {};

  for (const k of prevKeys) {
    const decryptedKey = await decryptPrivateKey(
      password,
      base64ToUint8Array(k.encryptedKey),
      base64ToUint8Array(k.salt),
      base64ToUint8Array(k.iv),
    );
    decryptedKeys[k.version] = new Uint8Array(decryptedKey);
  }
  const { error: localSaveError } = await tryCatch(saveLocalKeys(
    Object.entries(decryptedKeys).map(([version, decryptedKey]) => ({
      userId: user.id,
      privateKey: arrayBufferToBase64(decryptedKey.buffer),
      version: Number(version),
    })),
  ));
  if (localSaveError) {
    console.error(localSaveError);
    throw new Error('Error while saving the keys locally');
  }

  initSession(user, decryptedKeys);
};
