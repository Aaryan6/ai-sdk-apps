import { NextResponse } from "next/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import supabase from "@/lib/db";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

async function extractLinksFromChunk(content: string) {
  // Clean and truncate content to avoid JSON parsing issues
  const cleanContent = content
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove control characters
    .replace(/"/g, "'"); // Replace double quotes with single quotes

  try {
    const result = await generateObject({
      model: google("gemini-1.5-pro"),
      schema: z.object({
        data: z.array(
          z.object({
            url: z.string(),
            source: z.string(),
            statement: z.string(),
          })
        ),
      }),
      system:
        "Extract all URLs with statements and source from the given text.",
      prompt: `Extract all URLs with statements and source from the following content: ${cleanContent}`,
    });

    return result.object.data;
  } catch (error) {
    console.error("Error extracting links:", error);
    return [];
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    const loader = new PDFLoader(file);
    const docs = await loader.load();
    const content = docs.map((doc) => doc.pageContent).join("\n");

    // Clean and format content
    const formattedContent = content
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove control characters
      .replace(/\n+/g, " ") // Replace newlines with spaces
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();

    const data = await extractLinksFromChunk(formattedContent);

    console.log({ data });

    const { data: pdfData, error } = await supabase
      .from("pdf-content")
      .insert({ content: formattedContent, sources: data, title: file.name });

    console.log({ pdfData, error });

    return NextResponse.json({
      success: true,
      content: formattedContent,
      data,
    });
  } catch (error) {
    console.error("Error processing PDF:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process PDF" },
      { status: 500 }
    );
  }
}
