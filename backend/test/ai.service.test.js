const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

test("does not use mock predictions when the service is unconfigured in production", async () => {
  const previous = {
    NODE_ENV: process.env.NODE_ENV,
    ML_SERVICE_URL: process.env.ML_SERVICE_URL,
    ML_MOCK_FALLBACK: process.env.ML_MOCK_FALLBACK,
  };
  process.env.NODE_ENV = "production";
  delete process.env.ML_SERVICE_URL;
  process.env.ML_MOCK_FALLBACK = "true";

  const aiPath = require.resolve("../src/services/ai.service");
  delete require.cache[aiPath];
  const ai = require("../src/services/ai.service");
  try {
    await assert.rejects(
      ai.predict("/tmp/nonexistent-leaf.png"),
      (error) => error.status === 502 && error.message === "AI service is not configured",
    );
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test("returns a timeout error instead of waiting indefinitely for the ML service", async () => {
  process.env.NODE_ENV = "production";
  process.env.ML_SERVICE_URL = "http://127.0.0.1:8000";
  process.env.ML_SERVICE_TIMEOUT_MS = "10";

  const aiPath = require.resolve("../src/services/ai.service");
  delete require.cache[aiPath];
  const ai = require(aiPath);

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "leafwise-ai-"));
  const imagePath = path.join(tempDir, "leaf.png");
  await fs.writeFile(imagePath, Buffer.from("png"));

  const originalFetch = globalThis.fetch;
  globalThis.fetch = (_url, options) =>
    new Promise((_resolve, reject) => {
      options.signal.addEventListener("abort", () => {
        const error = new Error("aborted");
        error.name = "AbortError";
        reject(error);
      });
    });

  try {
    await assert.rejects(
      ai.predict(imagePath),
      (error) => error.status === 502 && error.message === "AI service timed out",
    );
  } finally {
    globalThis.fetch = originalFetch;
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});
