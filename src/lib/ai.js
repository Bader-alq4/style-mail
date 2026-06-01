import { getApiKey } from "./storage";
import {
  buildExtractionPrompt,
  buildPhrasesPrompt,
  buildDoNotUsePrompt,
  buildGenerationPrompt,
} from "./prompts";

async function callOpenAI(prompt, temperature = 0.3) {
  const apiKey = getApiKey();

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      max_tokens: 2000,
      temperature,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();

  if (data.error) {
    if (
      data.error.code === "invalid_api_key" ||
      data.error.type === "invalid_request_error"
    ) {
      throw new Error("INVALID_KEY");
    }
    throw new Error(data.error.message || "OpenAI API error");
  }

  return data.choices[0].message.content.trim();
}

function safeParseJSON(text) {
  try {
    // strip markdown code fences if present
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    // fallback: extract anything that looks like a quoted string
    const matches = text.match(/"([^"]+)"/g);
    return matches ? matches.map((m) => m.replace(/"/g, "")) : [];
  }
}

export async function extractStyle(name, emails) {
  const [profile, phrasesRaw, doNotUseRaw] = await Promise.all([
    callOpenAI(buildExtractionPrompt(name, emails), 0.5),
    callOpenAI(buildPhrasesPrompt(name, emails), 0.3),
    callOpenAI(buildDoNotUsePrompt(name, emails), 0.3),
  ]);

  return {
    styleProfile: profile,
    verbatimPhrases: safeParseJSON(phrasesRaw),
    doNotUse: safeParseJSON(doNotUseRaw),
  };
}

export async function generateEmail(contact, receivedEmail, input, mode) {
  const prompt = buildGenerationPrompt(contact, receivedEmail, input, mode);
  return callOpenAI(prompt, 0.3);
}
