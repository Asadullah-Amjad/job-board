export function str(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}
export function safeNext(next: string) {
  return next.startsWith("/") && !next.startsWith("//") ? next : "";
}
