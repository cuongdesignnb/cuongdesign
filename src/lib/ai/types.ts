export type AiTone = "professional" | "casual" | "luxury";
export type AiArticleLength = "short" | "medium" | "long";
export type InternalLinkTargetType = "article" | "product";

export interface InternalLinkCandidate {
  targetId: string;
  targetType: InternalLinkTargetType;
  title: string;
  href: string;
  anchors: string[];
  score: number;
}

export interface InternalLinkUsed {
  anchor: string;
  href: string;
  targetId: string;
  targetType: InternalLinkTargetType;
}

export interface AiImagePlan {
  prompt: string;
  alt: string;
  afterHeading: string;
}

export interface AiUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface GeneratedArticle {
  title: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  content: string;
  coverImageAlt: string;
  coverImagePrompt: string;
  imagePlans: AiImagePlan[];
  internalLinks: InternalLinkUsed[];
  usage?: AiUsage;
}

export interface GenerateArticleInput {
  topic: string;
  categoryId?: string | null;
  tone: AiTone;
  length: AiArticleLength;
  sharedKeywords: string[];
  imageCount: number;
}

export interface GeneratedImage {
  mediaId: string;
  url: string;
  alt: string;
  caption: string;
  width: number | null;
  height: number | null;
}

export interface ArticleGenerator {
  generate(input: GenerateArticleInput): Promise<GeneratedArticle>;
}

export interface ImageGenerator {
  generate(input: {
    title: string;
    prompt: string;
    alt: string;
    caption?: string;
    kind: "cover" | "inline";
  }): Promise<GeneratedImage>;
}
