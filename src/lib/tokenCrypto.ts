/**
 * AES-256-GCM encryption/decryption for tokens stored in Firestore.
 * Server-side only — uses Node.js crypto module.
 *
 * Format: "enc:v1:<iv_base64>:<authTag_base64>:<ciphertext_base64>"
 * The "enc:v1:" prefix allows detecting encrypted vs plaintext values (migration).
 */

import { randomBytes, createCipheriv, createDecipheriv } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits — recommended for GCM
const TAG_LENGTH = 16; // 128 bits
const PREFIX = "enc:v1:";

function getMasterKey(): Buffer {
  const hex = process.env.TOKEN_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      "TOKEN_ENCRYPTION_KEY must be a 64-char hex string (256 bits). " +
        "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }
  return Buffer.from(hex, "hex");
}

/** Returns true if the value looks like an encrypted token. */
export function isEncrypted(value: string): boolean {
  return value.startsWith(PREFIX);
}

/** Encrypts a plaintext token. Returns the prefixed encrypted string. */
export function encryptToken(plaintext: string): string {
  if (!plaintext) return plaintext;

  const key = getMasterKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return `${PREFIX}${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
}

/** Decrypts an encrypted token. If the value is plaintext (legacy), returns it as-is. */
export function decryptToken(value: string): string {
  if (!value) return value;

  // Legacy plaintext — return as-is (supports migration)
  if (!isEncrypted(value)) return value;

  const key = getMasterKey();
  const parts = value.slice(PREFIX.length).split(":");
  if (parts.length !== 3) throw new Error("Malformed encrypted token.");

  const iv = Buffer.from(parts[0], "base64");
  const tag = Buffer.from(parts[1], "base64");
  const ciphertext = Buffer.from(parts[2], "base64");

  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
