const videoIdPattern = /^[A-Za-z0-9_-]{11}$/;
const youtubeHosts = new Set(["youtube.com", "www.youtube.com", "m.youtube.com"]);

export const youtubeUrlError = "Liên kết YouTube không hợp lệ. Dùng URL HTTPS của một video (watch, youtu.be, shorts hoặc embed).";

export class YouTubeUrlValidationError extends Error {
  constructor() {
    super(youtubeUrlError);
    this.name = "YouTubeUrlValidationError";
  }
}

export function getYouTubeVideo(value: unknown) {
  if (typeof value !== "string") return null;
  const input = value.trim();
  if (!/^https:\/\//i.test(input) || /[\\\u0000-\u0020\u007f]/.test(input)) return null;
  try {
    const url = new URL(input);
    if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
    let id: string | undefined;
    if (url.hostname === "youtu.be") {
      id = /^\/([A-Za-z0-9_-]{11})$/.exec(url.pathname)?.[1];
    } else if (youtubeHosts.has(url.hostname)) {
      if (url.pathname === "/watch") {
        const ids = url.searchParams.getAll("v");
        if (ids.length === 1) id = ids[0];
      } else {
        id = /^\/(?:shorts|embed)\/([A-Za-z0-9_-]{11})$/.exec(url.pathname)?.[1];
      }
    }
    if (!id || !videoIdPattern.test(id)) return null;
    return {
      id,
      watchUrl: `https://www.youtube.com/watch?v=${id}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
    };
  } catch {
    return null;
  }
}

// Undefined means an older client omitted the field, not a request to clear it.
export function normalizeYouTubeUrl(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || (typeof value === "string" && !value.trim())) return null;
  const video = getYouTubeVideo(value);
  if (!video) throw new YouTubeUrlValidationError();
  return video.watchUrl;
}
