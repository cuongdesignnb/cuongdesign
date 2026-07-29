export const ADMIN_ASSETS_ENDPOINT = "/api/admin/assets";

function responseError(payload: unknown, status: number) {
  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    typeof payload.error === "string"
  ) {
    return payload.error;
  }

  if (status === 401) {
    return "Phiên đăng nhập đã hết hạn. Hãy tải lại trang và đăng nhập lại.";
  }

  return `Yêu cầu thất bại (HTTP ${status}).`;
}

export async function adminApiRequest<T>(
  input: string,
  init?: RequestInit,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(input, {
      cache: "no-store",
      credentials: "same-origin",
      ...init,
    });
  } catch {
    throw new Error(
      "Không thể kết nối tới máy chủ. Hãy tải lại trang hoặc tạm tắt tiện ích chặn nội dung.",
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  const payload: unknown = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null);

  if (!response.ok) {
    throw new Error(responseError(payload, response.status));
  }

  return payload as T;
}
