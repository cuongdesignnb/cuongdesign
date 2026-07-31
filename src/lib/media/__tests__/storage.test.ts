import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import path from "node:path";
import { afterEach, test } from "node:test";
import { GET } from "@/app/uploads/[...storageKey]/route";
import { resolveMediaStoragePath } from "../storage";

const testDirectory = `route-test-${process.pid}`;

afterEach(async () => {
  const { filePath } = resolveMediaStoragePath([testDirectory, "cleanup.webp"]);
  await fs.rm(path.dirname(filePath), { recursive: true, force: true });
});

test("resolves single and nested media keys inside the uploads directory", () => {
  const single = resolveMediaStoragePath("avatar.webp");
  const nested = resolveMediaStoragePath([
    "ai-generated",
    "2026-07",
    "cover.webp",
  ]);

  assert.equal(single.storageKey, "avatar.webp");
  assert.equal(
    nested.storageKey,
    "ai-generated/2026-07/cover.webp",
  );
  assert.ok(
    nested.filePath.startsWith(`${nested.uploadDirectory}${path.sep}`),
  );
});

test("rejects unsafe or malformed media keys", () => {
  for (const storageKey of [
    "../secret.webp",
    "ai-generated/../../secret.webp",
    "folder\\secret.webp",
    "/absolute.webp",
    "",
  ]) {
    assert.throws(
      () => resolveMediaStoragePath(storageKey),
      /INVALID_MEDIA_STORAGE_PATH/,
    );
  }
});

test("serves an AI-style nested upload path", async () => {
  const storageKey = [testDirectory, "2026-07", "cover.webp"];
  const { filePath } = resolveMediaStoragePath(storageKey);
  const content = Buffer.from("generated-image");
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content);

  const response = await GET(
    new Request(`http://localhost/uploads/${storageKey.join("/")}`),
    { params: Promise.resolve({ storageKey }) },
  );

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "image/webp");
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), content);
});
