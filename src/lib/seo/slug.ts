export interface SlugValidationResult {
  valid: boolean;
  normalized: string;
  warnings: string[];
  errors: string[];
}

const REDUNDANT_WORDS = new Set(["chi-tiet", "trang"]);

export function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase("vi")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function validateSlug(value: string): SlugValidationResult {
  const normalized = normalizeSlug(value);
  const words = normalized.split("-").filter(Boolean);
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!normalized) errors.push("Slug không được để trống.");
  if (value !== normalized) errors.push("Slug chỉ được dùng chữ thường, số và dấu gạch ngang.");
  if (normalized.length > 60) warnings.push("Slug nên ngắn hơn 60 ký tự.");
  if (words.length < 3 || words.length > 8) warnings.push("Slug nên có khoảng 3-8 từ.");
  if (words.some((word) => REDUNDANT_WORDS.has(word))) {
    warnings.push("Slug có từ dư thừa.");
  }

  return { valid: errors.length === 0, normalized, warnings, errors };
}
