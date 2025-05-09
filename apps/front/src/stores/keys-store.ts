import {
  ActivatedUser,
  PublicKey,
  UserDecryptedPrivateKeyRuntime,
} from '@shrymp/types';
import { atom } from 'jotai';

export const $currentChatKeys = atom<Record<string, PublicKey> | null>(null);
export const $currentChatUsers = atom<
  Record<ActivatedUser['id'], ActivatedUser> | null
>(
  null,
);
export const $privateKeys = atom<UserDecryptedPrivateKeyRuntime>({});
