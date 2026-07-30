const SECRET_KEY_PARTS = [
  "api_key",
  "secret",
  "password",
  "token",
  "smtp_pass",
] as const;

export function isSecretSettingKey(key: string): boolean {
  const normalized = key.trim().toLowerCase();
  return SECRET_KEY_PARTS.some((part) => normalized.includes(part));
}
