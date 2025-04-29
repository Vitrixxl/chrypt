import { PrivateKey, PublicKey } from '@shrymp/types';
import { atom } from 'jotai';

export const $keys = atom<Record<string, PublicKey> | null>(null);
export const $privateKeys = atom<PrivateKey[] | null>(null);
export const $isSessionActive = atom<boolean>(false);
