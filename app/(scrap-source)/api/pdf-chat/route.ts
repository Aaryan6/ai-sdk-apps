import { openai } from "@ai-sdk/openai";

import { generateObject, createDataStreamResponse, streamText } from "ai";
import { z } from "zod";
import { Source } from "../../_type";
import * as cheerio from "cheerio";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

async function scrapeLinkContent(url: string) {
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove unwanted elements
  $("script").remove();
  $("style").remove();
  $("nav").remove();
  $("header").remove();
  $("footer").remove();
  $(".ads").remove();
  $(".subscription").remove();
  $(".premium").remove();

  // Get main content
  const article =
    $("article").text() ||
    $(".article-content").text() ||
    $(".story-content").text() ||
    $("main").text();

  // Fallback to body if no specific content found
  const content = article || $("body").text();

  // Clean up whitespace and formatting
  const cleanContent = content
    .replace(/\s+/g, " ")
    .replace(/\n+/g, "\n")
    .trim();

  return cleanContent;
}

export async function POST(request: Request) {
  const {
    messages,
    content,
    data,
  }: { messages: any; content: string; data: Source[] } = await request.json();

  return createDataStreamResponse({
    execute: (dataStream) => {
      const result = streamText({
        model: google("gemini-1.5-flash-8b"),
        messages: messages,
        system: `You are a helpful assistant that analyzes news content. Use the following scraped content as your source of knowledge to answer questions: ${content}. 
    Only answer based on the information provided in the content. If the information isn't available in the content, say so.
    Be precise and factual in your responses.
    Rule: You must use the getContentFromExtractedLinks tool to get relevant information from the sources.`,
        toolChoice: "auto",
        maxSteps: 3,
        experimental_toolCallStreaming: true,
        tools: {
          getContentFromExtractedLinks: {
            description: "Get content from sources.",
            parameters: z.object({
              question: z.string({
                description: "need a user query with context of the question",
              }),
            }),
            execute: async ({ question }, { toolCallId }) => {
              console.log({ question });

              const result = await generateObject({
                model: google("gemini-1.5-flash-8b"),
                system: `You are a helpful assistant, choose the most relevant links from the given sources to answer the question: ${question}.`,
                prompt: `Sources: ${JSON.stringify(data)}`,
                schema: z.object({
                  links: z.array(z.string()),
                }),
              });

              const links = result.object.links;
              dataStream.writeMessageAnnotation({
                toolCallId: toolCallId,
                toolName: "getContentFromExtractedLinks",
                links: links,
                messageId: toolCallId,
              });
              let content = "";
              for (const link of links) {
                const linkContent = await scrapeLinkContent(link);
                content += `Source: ${link} ${linkContent}`;
              }
              console.log({ content });
              return content;
            },
          },
        },
      });
      result.mergeIntoDataStream(dataStream);
    },
  });
}
