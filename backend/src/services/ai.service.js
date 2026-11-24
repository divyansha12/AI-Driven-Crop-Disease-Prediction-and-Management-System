const fs = require("node:fs/promises");
const crypto = require("node:crypto");
const diseases = require("../../prisma/data/diseases");

const labels = diseases.map((disease) => disease.name);
const mlServiceUrl = process.env.ML_SERVICE_URL?.replace(/\/+$/, "");
const allowMockFallback = process.env.ML_MOCK_FALLBACK === "true";
const aiServiceTimeoutMs = Number(process.env.ML_SERVICE_TIMEOUT_MS) || 15000;

async function mockPredict(imagePath) {
  let image;

  try {
    image = await fs.readFile(imagePath);
  } catch (error) {
    const readError = new Error("Uploaded image could not be read");
    readError.status = 400;
    readError.cause = error;
    throw readError;
  }

  const hash = crypto.createHash("sha256").update(image).digest();
  const label = labels[hash[0] % labels.length];
  const confidence = Number((0.7 + (hash[1] / 255) * 0.29).toFixed(3));

  return { label, confidence };
}

function predictionError(message, cause) {
  const error = new Error(message);
  error.status = 502;
  error.cause = cause;
  return error;
}

async function realPredict(imagePath) {
  let image;
  try {
    image = await fs.readFile(imagePath);
  } catch (error) {
    const readError = new Error("Uploaded image could not be read");
    readError.status = 400;
    readError.cause = error;
    throw readError;
  }

  const form = new FormData();
  form.append("image", new Blob([image]), "image");

  let response;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), aiServiceTimeoutMs);
  try {
    response = await fetch(`${mlServiceUrl}/predict`, {
      method: "POST",
      body: form,
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw predictionError("AI service timed out");
    }
    throw predictionError("AI service is unavailable", error);
  } finally {
    clearTimeout(timeout);
  }

  let body;
  try {
    body = await response.json();
  } catch (error) {
    throw predictionError("AI service returned invalid JSON", error);
  }

  if (!response.ok) {
    throw predictionError(body.detail || "AI service prediction failed");
  }

  if (
    typeof body.label !== "string" ||
    !body.label ||
    typeof body.confidence !== "number" ||
    !Number.isFinite(body.confidence) ||
    body.confidence < 0 ||
    body.confidence > 1
  ) {
    throw predictionError("AI service returned an invalid prediction");
  }

  return { label: body.label, confidence: body.confidence };
}

exports.predict = async (imagePath) => {
  if (!mlServiceUrl) {
    if (!allowMockFallback) {
      throw predictionError("AI service is not configured");
    }
    exports.MODE = "mock";
    return mockPredict(imagePath);
  }

  try {
    exports.MODE = "real";
    return await realPredict(imagePath);
  } catch (error) {
    if (
      allowMockFallback &&
      error.message === "AI service is unavailable"
    ) {
      exports.MODE = "mock";
      return mockPredict(imagePath);
    }
    throw error;
  }
};

exports.mockPredict = mockPredict;
