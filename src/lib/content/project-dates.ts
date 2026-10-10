export class ProjectDateValidationError extends Error {
  constructor() {
    super("Ngày hoàn thành phải là ngày hợp lệ theo định dạng YYYY-MM-DD.");
    this.name = "ProjectDateValidationError";
  }
}

// completedAt is a calendar day, represented by UTC midnight for new selections.
export function parseProjectCompletedAt(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || (typeof value === "string" && !value.trim())) return null;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new ProjectDateValidationError();
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(date.getTime()) || date.getUTCFullYear() < 1 || date.toISOString().slice(0, 10) !== value) {
    throw new ProjectDateValidationError();
  }
  return date;
}

export function projectCompletedAtFormState(value: unknown): { value: string; error?: string } {
  if (value === null || value === undefined || value === "") return { value: "" };
  try {
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return { value: parseProjectCompletedAt(value)!.toISOString().slice(0, 10) };
    }
    const date = value instanceof Date ? value :
      typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) ? new Date(value) : null;
    if (!date || !Number.isFinite(date.getTime()) || date.getUTCFullYear() < 1 || date.getUTCFullYear() > 9999) {
      throw new ProjectDateValidationError();
    }
    if (typeof value === "string" && date.toISOString() !== value) throw new ProjectDateValidationError();
    return { value: date.toISOString().slice(0, 10) };
  } catch {
    return { value: "", error: "Ngày hoàn thành hiện có không đọc được. Cần xác nhận lại hoặc chủ động xóa ngày trước khi lưu." };
  }
}

export function projectCompletedAtForUpdate(value: Date | null | undefined, previous: Date | null): Date | null | undefined {
  if (value === undefined || value === null) return value;
  const state = projectCompletedAtFormState(previous);
  // A metadata-only save must not truncate an existing non-midnight timestamp.
  if (!state.error && state.value === value.toISOString().slice(0, 10)) return previous;
  return value;
}
