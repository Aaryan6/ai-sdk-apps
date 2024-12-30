import { createOpenAI } from "@ai-sdk/openai";
import { generateText, streamText } from "ai";

const openai = createOpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com/v1",
});

export async function POST(request: Request) {
  const { messages } = await request.json();

  const result = await streamText({
    model: openai("deepseek-chat"),
    messages: messages,
    system: "You are a helpful assistant.",
  });

  return result.toDataStreamResponse();
}
