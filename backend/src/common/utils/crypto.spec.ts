import { generateIV, encrypt, decrypt } from './crypto.util';
import { randomBytes } from 'crypto';

describe('Crypto Utils', () => {
  it('should generate a valid IV', () => {
    const iv = generateIV();
    expect(iv).toBeDefined();
    expect(iv.length).toBe(16); // AES block size is 16 bytes
  });

  it('should encrypt and decrypt text correctly', () => {
    const text = 'Hello, World!';
    const key = randomBytes(32); // AES-256 requires a 32-byte key
    const iv = generateIV();

    const encryptedText = encrypt(text, key, iv);
    expect(encryptedText).toBeDefined();

    const decryptedText = decrypt(encryptedText, key, iv);
    expect(decryptedText).toBe(text);
  });
});
