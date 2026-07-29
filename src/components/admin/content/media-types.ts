export interface MediaRecord {
  id: string;
  name: string;
  url: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: string | null;
  caption: string | null;
  mimeType: string | null;
  createdAt: string;
  usage?: { count: number; locations: string[] };
}
