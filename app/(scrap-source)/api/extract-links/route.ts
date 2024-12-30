import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(req: Request) {
  const { content }: { content: string } = await req.json();

  console.log({ content });

  const result = await generateObject({
    model: google("gemini-1.5-pro"),
    maxTokens: 20000,
    schema: z.object({
      links: z.array(z.string()),
    }),
    maxRetries: 3,
    experimental_telemetry: {
      isEnabled: true,
    },
    system:
      "You are a link extraction specialist. Extract all URLs and links from the given text. Return them as a JSON array.",
    prompt: `Extract all URLs and links from the following content. Return only the links array: ${content}`,
  });

  console.log({ result: result.object });

  return result.toJsonResponse();
}
