import crypto from "node:crypto";

const KEY_LENGTH = 64;

export function createOpaqueToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16);
  const derived = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LENGTH, { N: 16_384, r: 8, p: 1 }, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
  return `scrypt$${salt.toString("base64url")}$${derived.toString("base64url")}`;
}

export async function verifyPassword(password: string, encoded: string) {
  const [algorithm, saltText, hashText] = encoded.split("$");
  if (algorithm !== "scrypt" || !saltText || !hashText) return false;
  const salt = Buffer.from(saltText, "base64url");
  const expected = Buffer.from(hashText, "base64url");
  const actual = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, expected.length, { N: 16_384, r: 8, p: 1 }, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}
