import crypto from "node:crypto";
import { readDb, updateDb, uid } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import type { SafeUser, User } from "@/types/db.types";

export function toSafe(user: User): SafeUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...safe } = user;
  return safe;
}

export function findUserById(id: string) {
  return readDb().users.find((u) => u.id === id) ?? null;
}

export function registerUser(input: { name: string; email: string; password: string }) {
  return updateDb((db) => {
    if (db.users.some((u) => u.email === input.email)) {
      return { error: "This email is already registered." } as const;
    }
    const user: User = {
      id: uid(),
      name: input.name,
      email: input.email,
      passwordHash: hashPassword(input.password),
      role: "candidate",
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    return { user } as const;
  });
}

export function verifyLogin(email: string, password: string) {
  const user = readDb().users.find((u) => u.email === email);
  if (!user || !verifyPassword(password, user.passwordHash)) return null;
  return user;
}

export function createResetToken(email: string) {
  return updateDb((db) => {
    const user = db.users.find((u) => u.email === email);
    if (!user) return null;
    const token = crypto.randomBytes(24).toString("hex");
    db.resetTokens = db.resetTokens.filter((t) => t.userId !== user.id);
    db.resetTokens.push({ token, userId: user.id, expires: Date.now() + 3_600_000 });
    return token;
  });
}

export function resetPassword(token: string, password: string) {
  return updateDb((db) => {
    const t = db.resetTokens.find((x) => x.token === token && x.expires > Date.now());
    const user = t && db.users.find((u) => u.id === t.userId);
    if (!t || !user) return false;
    user.passwordHash = hashPassword(password);
    db.resetTokens = db.resetTokens.filter((x) => x.token !== token);
    return true;
  });
}

export function updateProfile(
  id: string,
  data: { name: string; phone: string; city: string; skills: string; bio: string }
) {
  updateDb((db) => {
    const user = db.users.find((u) => u.id === id);
    if (user) Object.assign(user, data);
  });
}

export function addContactMessage(m: { name: string; email: string; message: string }) {
  updateDb((db) => {
    db.messages.push({ id: uid(), ...m, createdAt: new Date().toISOString() });
  });
}
