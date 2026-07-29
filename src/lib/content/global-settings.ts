import type { GlobalContent } from "@/content/defaults/global";

export const GLOBAL_SETTING_KEYS = [
  "contact_email",
  "contact_phone",
  "contact_zalo",
  "contact_location",
  "contact_facebook",
  "contact_github",
] as const;

type GlobalSettingKey = (typeof GLOBAL_SETTING_KEYS)[number];
type SettingEntry = { key: string; value: string };
type GlobalSettings = Partial<Record<GlobalSettingKey, string>>;

function toSettings(entries: SettingEntry[] | Record<string, string>): GlobalSettings {
  if (!Array.isArray(entries)) return entries;
  return Object.fromEntries(entries.map(({ key, value }) => [key, value])) as GlobalSettings;
}

function configured(value: string | undefined, fallback: string, includeEmpty: boolean) {
  if (value === undefined) return fallback;
  return includeEmpty ? value.trim() : value.trim() || fallback;
}

export function applyGlobalSettings(
  content: GlobalContent,
  entries: SettingEntry[] | Record<string, string>,
  includeEmpty = false,
): GlobalContent {
  const settings = toSettings(entries);

  return {
    ...content,
    contact: {
      ...content.contact,
      email: configured(settings.contact_email, content.contact.email, includeEmpty),
      phone: configured(settings.contact_phone, content.contact.phone, includeEmpty),
      zalo: configured(settings.contact_zalo, content.contact.zalo, includeEmpty),
      address: configured(settings.contact_location, content.contact.address, includeEmpty),
    },
    social: {
      ...content.social,
      facebook: configured(settings.contact_facebook, content.social.facebook, includeEmpty),
      github: configured(settings.contact_github, content.social.github, includeEmpty),
    },
  };
}

export function globalContentToSettings(content: GlobalContent): Record<GlobalSettingKey, string> {
  return {
    contact_email: content.contact.email,
    contact_phone: content.contact.phone,
    contact_zalo: content.contact.zalo,
    contact_location: content.contact.address,
    contact_facebook: content.social.facebook,
    contact_github: content.social.github,
  };
}
