import React from "react";
import { getYouTubeVideo } from "@/lib/video/youtube";

interface YouTubeVideoProps {
  url?: string | null;
  title: string;
  kind: "project" | "product";
}

export default function YouTubeVideo({ url, title, kind }: YouTubeVideoProps) {
  const video = getYouTubeVideo(url);
  if (!video) return null;
  // A URL alone is not verified upload/thumbnail metadata: do not emit VideoObject.
  return (
    <section className="youtube-video" aria-label={kind === "project" ? "Video giới thiệu dự án" : "Video giới thiệu sản phẩm"}>
      <h2>{kind === "project" ? "Video giới thiệu dự án" : "Video giới thiệu sản phẩm"}</h2>
      <iframe key={video.id} src={video.embedUrl}
        title={`Video giới thiệu ${kind === "project" ? "dự án" : "sản phẩm"}: ${title}`}
        width="1280" height="720" loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
      <a href={video.watchUrl} target="_blank" rel="noopener noreferrer">Xem trên YouTube</a>
    </section>
  );
}
