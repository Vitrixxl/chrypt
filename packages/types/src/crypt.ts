import { privateKey } from '../../../apps/back/src/libs/db/schema';

export type PrivateKey = {
  /**
   * Base64 Encrypted key in the db
   */
  key: string;
  /**
   * Decrypted key generated on the front-end
   */
  decryptedKey: ArrayBuffer | null;

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
  privateKeyVersion: number;
};

export type AESKey = {
  encryptedAESKey: string;
  privateKeyVersion: number;
};

export type UserPrivateKey = typeof privateKey.$inferSelect;
