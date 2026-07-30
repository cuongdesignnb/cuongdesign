import type { AiRuntimeConfig } from "./settings";

export type Fetcher = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

export interface ProviderUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

interface ProviderMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class AiProviderError extends Error {
  constructor(
    public readonly provider: "text" | "image",
    public readonly providerStatus: number,
    message: string,
  ) {
    super(message);
    this.name = "AiProviderError";
  }
}

export function providerEndpoint(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

function stringAt(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function extractTextResponse(payload: unknown): string {
  const root = (payload && typeof payload === "object" ? payload : {}) as Record<
    string,
    unknown
  >;
  const nestedResponse =
    root.response && typeof root.response === "object"
      ? (root.response as Record<string, unknown>)
      : {};
  const nestedData =
    root.data && !Array.isArray(root.data) && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : {};

  for (const candidate of [
    root.output_text,
    nestedResponse.output_text,
    nestedData.output_text,
  ]) {
    const text = stringAt(candidate);
    if (text) return text;
  }

  const choices = Array.isArray(root.choices) ? root.choices : [];
  for (const choice of choices) {
    if (!choice || typeof choice !== "object") continue;
    const item = choice as Record<string, unknown>;
    const message =
      item.message && typeof item.message === "object"
        ? (item.message as Record<string, unknown>)
        : {};
    const text = stringAt(message.content) || stringAt(item.text);
    if (text) return text;
  }

  const output = Array.isArray(root.output) ? root.output : [];
  const fragments: string[] = [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = Array.isArray((item as Record<string, unknown>).content)
      ? ((item as Record<string, unknown>).content as unknown[])
      : [];
    for (const part of content) {
      if (!part || typeof part !== "object") continue;
      const record = part as Record<string, unknown>;
      if (record.type === "output_text" || record.type === "text") {
        const text = stringAt(record.text);
        if (text) fragments.push(text);
      }
    }
  }
  return fragments.join("\n").trim();
}

export function extractProviderUsage(payload: unknown): ProviderUsage | undefined {
  const root = (payload && typeof payload === "object" ? payload : {}) as Record<
    string,
    unknown
  >;
  const usage =
    root.usage && typeof root.usage === "object"
      ? (root.usage as Record<string, unknown>)
      : null;
  if (!usage) return undefined;

  const numberValue = (...keys: string[]) => {
    for (const key of keys) {
      const value = usage[key];
      if (typeof value === "number" && Number.isFinite(value)) return value;
    }
    return undefined;
  };
  return {
    promptTokens: numberValue("prompt_tokens", "input_tokens"),
    completionTokens: numberValue("completion_tokens", "output_tokens"),
    totalTokens: numberValue("total_tokens"),
  };
}

export function cleanJsonText(value: string): string {
  const withoutFence = value
    .trim()
    .replace(/^```(?:json|html)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const firstBrace = withoutFence.indexOf("{");
  const lastBrace = withoutFence.lastIndexOf("}");
  return firstBrace >= 0 && lastBrace > firstBrace
    ? withoutFence.slice(firstBrace, lastBrace + 1)
    : withoutFence;
}

function providerMessage(body: string, fallback: string): string {
  const limited = body.trim().slice(0, 600);
  if (!limited) return fallback;
  try {
    const payload = JSON.parse(limited) as {
      error?: { message?: string } | string;
      message?: string;
    };
    if (typeof payload.error === "object" && payload.error?.message) {
      return payload.error.message.slice(0, 600);
    }
    if (typeof payload.error === "string") return payload.error.slice(0, 600);
    if (payload.message) return payload.message.slice(0, 600);
  } catch {
    // Keep the limited upstream text when it is not JSON.
  }
  return limited;
}

export async function requestArticleText(input: {
  config: AiRuntimeConfig;
  instructions: string;
  userInput: string;
  schema: Record<string, unknown>;
  fetcher?: Fetcher;
}): Promise<{ text: string; usage?: ProviderUsage }> {
  const { config, instructions, userInput, schema } = input;
  const fetcher = input.fetcher || fetch;
  const isResponses = config.textWireApi === "responses";
  const endpoint = providerEndpoint(
    config.textBaseUrl,
    isResponses ? "responses" : "chat/completions",
  );
  const body = isResponses
    ? {
        model: config.textModel,
        instructions,
        input: userInput,
        reasoning: { effort: config.textReasoningEffort },
        max_output_tokens: config.textMaxTokens,
        store: false,
        text: {
          format: {
            type: "json_schema",
            name: "seo_article",
            strict: true,
            schema,
          },
        },
      }
    : {
        model: config.textModel,
        messages: [
          { role: "system", content: instructions },
          { role: "user", content: userInput },
        ],
        max_tokens: config.textMaxTokens,
      };

  const response = await fetcher(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.textApiKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const detail = providerMessage(
      await response.text(),
      `Text provider returned HTTP ${response.status}`,
    );
    throw new AiProviderError("text", response.status, detail);
  }

  const payload = await response.json();
  const text = extractTextResponse(payload);
  if (!text) throw new Error("AI_TEXT_EMPTY_RESPONSE");
  return { text, usage: extractProviderUsage(payload) };
}

export async function requestChatText(input: {
  config: AiRuntimeConfig;
  messages: ProviderMessage[];
  maxTokens?: number;
  fetcher?: Fetcher;
}): Promise<string> {
  const fetcher = input.fetcher || fetch;
  const isResponses = input.config.textWireApi === "responses";
  const endpoint = providerEndpoint(
    input.config.textBaseUrl,
    isResponses ? "responses" : "chat/completions",
  );
  const system = input.messages.find((message) => message.role === "system");
  const conversation = input.messages.filter(
    (message) => message.role !== "system",
  );
  const maxTokens = Math.min(
    input.maxTokens || input.config.textMaxTokens,
    input.config.textMaxTokens,
  );
  const body = isResponses
    ? {
        model: input.config.textModel,
        instructions: system?.content || "",
        input: conversation
          .map((message) => `${message.role}: ${message.content}`)
          .join("\n"),
        reasoning: { effort: input.config.textReasoningEffort },
        max_output_tokens: maxTokens,
        store: false,
      }
    : {
        model: input.config.textModel,
        messages: input.messages,
        max_tokens: maxTokens,
      };

  const response = await fetcher(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${input.config.textApiKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const detail = providerMessage(
      await response.text(),
      `Text provider returned HTTP ${response.status}`,
    );
    throw new AiProviderError("text", response.status, detail);
  }
  const text = extractTextResponse(await response.json());
  if (!text) throw new Error("AI_TEXT_EMPTY_RESPONSE");
  return text;
}
