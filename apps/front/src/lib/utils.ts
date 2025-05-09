import { type ClassValue, clsx } from 'clsx';
import { tryCatch } from '@shrymp/utils';
import { twMerge } from 'tailwind-merge';
import { message } from '../../../back/src/libs/db/schema';
import { ApiResponse } from '@shrymp/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type HTTPMethods = 'POST' | 'GET' | 'DELETE' | 'PUT' | 'PATCH';

export const generateSafeFetch = () => {
  const baseUrl = import.meta.env.VITE_BASE_API_URL;
  return async <T>(
    path: string,
    opts?: Omit<RequestInit, 'body' | 'method'> & {
      body?: Record<string, any>;
      method?: HTTPMethods;
    },
  ) => {
    console.log({ body: JSON.stringify(opts?.body) });
    const { data, error } = await tryCatch<Response>(
      fetch(new URL(path, baseUrl), {
        ...opts,
        credentials: 'include',
        headers: {
          ...opts?.headers,
          'Content-Type': 'application/json',
        },
        body: opts?.body ? JSON.stringify(opts.body) : null,
      }),
    );

    if (error) {
      console.error(error);
      return {
        data: null,
        error: {
          message: error.message,
          details: error,
        },
      };
    }
    const { data: parseData, error: parseError } = await tryCatch<
      ApiResponse<T>
    >(data.json());

    if (parseError) {
      return {
        data: null,
        error: {
          message: parseError.message,
          details: parseError,
        },
      };
    }
    if (parseData.error) {
      console.error(parseData.error);
    }
    return parseData;
  };
};

export const safeFetch = generateSafeFetch();

export const base64ToArrayBuffer = (base64: string) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};
export const base64ToUint8Array = (base64: string) => {
  return new Uint8Array(base64ToArrayBuffer(base64));
};

export const arrayBufferToBase64 = (arrayBuffer: ArrayBufferLike): string => {
  const uint8Array = new Uint8Array(arrayBuffer);
  const binaryString = String.fromCharCode(...uint8Array);
  return btoa(binaryString);
};
