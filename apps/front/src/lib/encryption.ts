import type { PrivateKey } from '@shrymp/types';
import { arrayBufferToBase64, base64ToArrayBuffer } from './utils';

export const generateRSAKeys = async (passphrase: string) => {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt'],
  );

  const publicKey = await window.crypto.subtle.exportKey(
    'spki',
    keyPair.publicKey,
  );
  const privateKey = await window.crypto.subtle.exportKey(
    'pkcs8',
    keyPair.privateKey,
  );

  const { iv, salt, encryptedPrivateKey } = await encryptPrivateKey(
    passphrase,
    privateKey,
  );
  return {
    publicKey: arrayBufferToBase64(publicKey),
    privateKey: {
      key: arrayBufferToBase64(encryptedPrivateKey),
      decryptedKey: privateKey,
      iv: arrayBufferToBase64(iv.buffer),
      salt: arrayBufferToBase64(salt.buffer),
    } satisfies Omit<PrivateKey, 'version'>,
  };
};

export const encryptPrivateKey = async (
  passphrase: string,
  privateKey: ArrayBuffer,
) => {
  const encoder = new TextEncoder();
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const aesKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt'],
  );

  const encryptedPrivateKey = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    aesKey,
    privateKey,
  );

  return { encryptedPrivateKey, salt, iv };
};

export const decryptPrivateKey = async (
  passphrase: string,
  encryptedPrivateKey: ArrayBuffer,
  salt: ArrayBuffer,
  iv: ArrayBuffer,
) => {
  const encoder = new TextEncoder();

  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  const aesKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt'],
  );

  const decryptedPrivateKey = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    aesKey,
    encryptedPrivateKey,
  );

  return decryptedPrivateKey;
};

export const generateAESKey = async () => {
  const key = await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt'],
  );
  return key;
};

export const encryptAESKey = async (
  aesKey: CryptoKey,
  publicKey: string,
): Promise<ArrayBuffer> => {
  const rsaKey = await window.crypto.subtle.importKey(
    'spki',
    Uint8Array.from(atob(publicKey), (c) => c.charCodeAt(0)),
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['encrypt'],
  );
  const rawKey = await window.crypto.subtle.exportKey('raw', aesKey);
  const encryptedKey = await window.crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    rsaKey,
    rawKey,
  );
  return encryptedKey;
};

export const decryptAESKey = async (
  encryptedKey: ArrayBuffer,
  privateKey: string,
): Promise<CryptoKey> => {
  const rsaKey = await window.crypto.subtle.importKey(
    'pkcs8',
    Uint8Array.from(atob(privateKey), (c) => c.charCodeAt(0)),
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['decrypt'],
  );
  const rawKey = await window.crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    rsaKey,
    encryptedKey,
  );
  const aesKey = await window.crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt'],
  );
  return aesKey;
};

export const encryptMessage = async (message: string) => {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const aesKey = await generateAESKey();
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    enc.encode(message),
  );

  return { ciphertext, iv, aesKey };
};

export const decryptMessage = async (
  base64Key: string,
  encrypted: { ciphertext: ArrayBuffer; iv: Uint8Array },
) => {
  const rawKey = base64ToArrayBuffer(base64Key);

  const key = await window.crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: 'AES-GCM' },
    false,
    ['decrypt'],
  );

  const dec = new TextDecoder();
  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: encrypted.iv },
    key,
    encrypted.ciphertext,
  );
  return dec.decode(decrypted);
};
