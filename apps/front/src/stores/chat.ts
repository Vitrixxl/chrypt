import { atom } from 'jotai';

export const $newMessageTrigger = atom(false);
export const $currentChatNewMessages = atom<Record<string, number>>({});
