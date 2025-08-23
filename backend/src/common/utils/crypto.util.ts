import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export function encrypt(
  text: string,
  key: Buffer | string,
  iv: Buffer,
): string {
  const cipher = createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export function decrypt(
  encryptedText: string,
  key: Buffer | string,
  iv: Buffer,
): string {
  const decipher = createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export function generateIV(): Buffer {
  return randomBytes(16); // 16 bytes for AES block size will result in a 32-character hexadecimal string.
}
