import { atom } from 'jotai';

export const $newMessageTrigger = atom(false);
export const $newMessages = atom<Record<string, number>>({});
export const $newChats = atom<number>(0);
