import { getPublishedFavicon } from "@/lib/media/favicon";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const favicon = await getPublishedFavicon();
  const body = new Uint8Array(favicon.body).buffer;

  return new Response(body, {
    headers: {
      "Content-Type": favicon.contentType,
      "Cache-Control": "public, max-age=0, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
