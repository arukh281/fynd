import fetch from "node-fetch";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

type OpenRouterResponse = {
  choices: {
    message: {
      content: string;
    };
  }[];
};

export async function callLlama(prompt: string): Promise<string> {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3.1-8b-instruct",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    throw new Error("LLM request failed");
  }

  const data = (await res.json()) as OpenRouterResponse;
  return data.choices[0].message.content;
}
