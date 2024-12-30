"use server";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

const googleGenerativeAI = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function search(query: string) {
  const { text } = await generateText({
    model: googleGenerativeAI("gemini-1.5-pro", {
      useSearchGrounding: true,
    }),
    prompt: query,
  });

  return { text };
}
