import assert from "node:assert/strict";
import test from "node:test";
import {
  extractTextResponse,
  requestArticleText,
  type Fetcher,
} from "../provider";
import { requestImageSource } from "../openai-image-generator";
import {
  resolveAiRuntimeConfig,
  type AiRuntimeConfig,
} from "../settings";
import { isSecretSettingKey } from "@/lib/settings/secrets";

const schema = {
  type: "object",
  properties: { content: { type: "string" } },
  required: ["content"],
};

function runtime(overrides: Partial<AiRuntimeConfig> = {}): AiRuntimeConfig {
  return {
    textApiKey: "content-key",
    textBaseUrl: "https://modelapi.vn/v1",
    textWireApi: "chat_completions",
    textModel: "gpt-5.5",
    textReasoningEffort: "high",
    textMaxTokens: 4096,
    imageApiKey: "image-key",
    imageBaseUrl: "https://api.openai.com/v1",
    imageModel: "gpt-image-2",
    imageQuality: "medium",
    writerPrompt: "",
    autoEnabled: false,
    batchLimit: 5,
    ...overrides,
  };
}

test("resolves database over env and ignores empty database values", () => {
  const config = resolveAiRuntimeConfig(
    {
      openai_api_key: " db-content-key ",
      openai_text_api_key: "writer-key",
      openai_base_url: "",
      openai_model: "gpt-5.5",
      openai_image_api_key: "db-image-key",
    },
    {
      OPENAI_API_KEY: "env-content-key",
      OPENAI_BASE_URL: "https://env-provider.example/v1/",
      OPENAI_IMAGE_API_KEY: "env-image-key",
    },
  );

  assert.equal(config.textApiKey, "writer-key");
  assert.equal(config.textBaseUrl, "https://env-provider.example/v1");
  assert.equal(config.imageApiKey, "db-image-key");
  assert.equal(config.textWireApi, "chat_completions");
  assert.equal(config.imageModel, "gpt-image-2");
});

test("rejects insecure base URLs and invalid image quality", () => {
  assert.throws(
    () => resolveAiRuntimeConfig({ openai_base_url: "http://provider.test" }, {}),
    /OPENAI_BASE_URL_HTTPS_REQUIRED/,
  );
  assert.throws(
    () =>
      resolveAiRuntimeConfig({ openai_image_quality: "ultra" }, {}),
    /OPENAI_IMAGE_QUALITY_INVALID/,
  );
  assert.throws(
    () => resolveAiRuntimeConfig({}, { OPENAI_MAX_TOKENS: "0" }),
    /OPENAI_MAX_TOKENS_INVALID/,
  );
});

test("chat completions uses the content provider contract", async () => {
  let calledUrl = "";
  let calledInit: RequestInit | undefined;
  const fetcher: Fetcher = async (url, init) => {
    calledUrl = String(url);
    calledInit = init;
    return Response.json({
      choices: [{ message: { content: '{"content":"OK"}' } }],
    });
  };
  const result = await requestArticleText({
    config: runtime(),
    instructions: "system",
    userInput: "topic",
    schema,
    fetcher,
  });
  const body = JSON.parse(String(calledInit?.body));
  const headers = calledInit?.headers as Record<string, string>;

  assert.equal(calledUrl, "https://modelapi.vn/v1/chat/completions");
  assert.equal(headers.Authorization, "Bearer content-key");
  assert.equal(body.model, "gpt-5.5");
  assert.equal(body.max_tokens, 4096);
  assert.equal(body.instructions, undefined);
  assert.equal(result.text, '{"content":"OK"}');
});

test("responses mode sends reasoning and parses all compatible text shapes", async () => {
  let body: Record<string, unknown> = {};
  const fetcher: Fetcher = async (_url, init) => {
    body = JSON.parse(String(init?.body));
    return Response.json({
      output: [{ content: [{ type: "output_text", text: '{"content":"OK"}' }] }],
    });
  };
  const result = await requestArticleText({
    config: runtime({
      textBaseUrl: "https://api.openai.com/v1",
      textWireApi: "responses",
    }),
    instructions: "system",
    userInput: "topic",
    schema,
    fetcher,
  });

  assert.deepEqual(body.reasoning, { effort: "high" });
  assert.equal(body.max_output_tokens, 4096);
  assert.equal(body.store, false);
  assert.equal(result.text, '{"content":"OK"}');
  assert.equal(extractTextResponse({ output_text: "one" }), "one");
  assert.equal(
    extractTextResponse({ response: { output_text: "two" } }),
    "two",
  );
  assert.equal(
    extractTextResponse({ choices: [{ text: "three" }] }),
    "three",
  );
});

test("image request uses only the image provider key and supports base64", async () => {
  let calledUrl = "";
  let headers: Record<string, string> = {};
  const fetcher: Fetcher = async (url, init) => {
    calledUrl = String(url);
    headers = init?.headers as Record<string, string>;
    return Response.json({
      data: [{ b64_json: Buffer.from("image-data").toString("base64") }],
    });
  };
  const source = await requestImageSource({
    config: runtime(),
    prompt: "A clean portfolio",
    fetcher,
  });

  assert.equal(calledUrl, "https://api.openai.com/v1/images/generations");
  assert.equal(headers.Authorization, "Bearer image-key");
  assert.equal(headers.Authorization.includes("content-key"), false);
  assert.equal(source.toString(), "image-data");
});

test("image request downloads HTTPS URLs and rejects HTTP URLs", async () => {
  const httpsFetcher: Fetcher = async (url) => {
    if (String(url).endsWith("/images/generations")) {
      return Response.json({ data: [{ url: "https://cdn.example/image.png" }] });
    }
    return new Response(Buffer.from("downloaded"));
  };
  const downloaded = await requestImageSource({
    config: runtime(),
    prompt: "Image",
    fetcher: httpsFetcher,
  });
  assert.equal(downloaded.toString(), "downloaded");

  const httpFetcher: Fetcher = async () =>
    Response.json({ data: [{ url: "http://cdn.example/image.png" }] });
  await assert.rejects(
    requestImageSource({
      config: runtime(),
      prompt: "Image",
      fetcher: httpFetcher,
    }),
    /AI_IMAGE_DOWNLOAD_HTTPS_REQUIRED/,
  );
});

test("secret setting detector blocks all sensitive setting families", () => {
  for (const key of [
    "openai_api_key",
    "openai_image_api_key",
    "smtp_password",
    "smtp_pass",
    "telegram_bot_token",
    "payment_secret",
  ]) {
    assert.equal(isSecretSettingKey(key), true, key);
  }
  assert.equal(isSecretSettingKey("theme_primary_color"), false);
});
