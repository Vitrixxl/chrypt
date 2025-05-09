import { privateKey } from '../../../apps/back/src/libs/db/schema';
import { User } from './auth';

export type PrivateKey = {
  /**
   * Base64 key generated on the front-end
   */
  encryptedKey: string;

  /**
   * Base64 Iv stored in the db
   */
  iv: string;
  /**
   * Base64 Salt stored in the db
   */
  salt: string;
  /**
   * Version of the key used to track which key ecrypted which message
   */
  version: number;
};

export type PublicKey = {
  key: string;
  version: number;
};

export type AESKey = {
  encryptedAESKey: string;
  privateKeyVersion: number;
};

export type UserPrivateKey = typeof privateKey.$inferSelect;
export type UserDecryptedPrivateKey = {
  /**
   * Database id
   */
  id: string;

  userId: User['id'];
  /**
   * Base64 version of the private Key
   */
  privateKey: string;
  /**
   * Version of the key used to track which key ecrypted which message
   */
  version: number;
};

/**
 * The key will be the version
 */
export type UserDecryptedPrivateKeyRuntime = Record<number, Uint8Array>;
