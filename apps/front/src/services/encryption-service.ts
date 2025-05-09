export const generateRSAKeys = async () => {
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

  return {
    publicKey,
    privateKey,
  };
};

export const encryptPrivateKey = async (
  privateKey: Uint8Array,
  passphrase: string,
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
  encryptedPrivateKey: Uint8Array,
  salt: Uint8Array,
  iv: Uint8Array,
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
  publicKey: Uint8Array,
): Promise<ArrayBuffer> => {
  const rsaKey = await window.crypto.subtle.importKey(
    'spki',
    publicKey,
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
  encryptedKey: Uint8Array,
  privateKey: Uint8Array,
): Promise<CryptoKey> => {
  debugger;
  const rsaKey = await window.crypto.subtle.importKey(
    'pkcs8',
    privateKey,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    false,
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

export const decryptString = async (
  key: CryptoKey,
  ciphertext: Uint8Array,
  iv: Uint8Array,
) => {
  const dec = new TextDecoder();
  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext,
  );
  return dec.decode(decrypted);
};
