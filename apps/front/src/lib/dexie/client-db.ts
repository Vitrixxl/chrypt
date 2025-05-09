import { UserDecryptedPrivateKey } from '@shrymp/types';
import Dexie, { type EntityTable } from 'dexie';
const db = new Dexie('shrymp_db') as Dexie & {
  privateKeys: EntityTable<UserDecryptedPrivateKey, 'id'>;
};

db.version(1).stores({
  privateKeys: '++id, userId, privateKey, iv, salt, version', // Primary key and indexed props
});

export { db };
