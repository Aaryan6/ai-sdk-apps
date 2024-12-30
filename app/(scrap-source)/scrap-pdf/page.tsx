"use client";

import { MasonryIcon, VercelIcon } from "@/components/icons";
import { Message } from "@/app/(scrap-source)/components/message";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { useChat } from "ai/react";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Source } from "../_type";
import supabase from "@/lib/db";

export default function Home() {
  const [scrapedContent, setScrapedContent] = useState<string>("");
  const [data, setData] = useState<Source[]>([]);
  const {
    messages,
    handleSubmit,
    input,
    setInput,
    append,
    data: sourcesData,
  } = useChat({
    api: "/api/pdf-chat",
    body: {
      content: scrapedContent,
      data: data,
    },
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const { data: pdfData } = await supabase
        .from("pdf-content")
        .select("*")
        .eq("id", "1")
        .single();

      setData(pdfData?.sources);
      setScrapedContent(pdfData?.content);
    })();
  }, []);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/process-pdf", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      console.log({ result });

      if (result.success) {
        toast.success("PDF processed successfully");
        setScrapedContent(result.content);
        setData(result.data);
        console.log({ content: result.content });

        append({
          role: "system",
          content: `PDF processed successfully. Found ${result.data.length} unique links in the content. You can now ask questions about it.`,
        });
      }
    } catch (error) {
      console.error("Error processing PDF:", error);
      toast.error("Failed to process PDF");
    } finally {
      setIsUploading(false);
    }
  };

  const suggestedActions = [
    {
      title: "Analyze Content",
      label: "Extract main topics",
      action: "What are the main topics discussed in this content?",
    },
    {
      title: "Summarize",
      label: "Get key points",
      action: "Can you summarize the key points from the scraped content?",
    },
  ];

  useEffect(() => {
    console.log({ messages });
    console.log({ sourcesData });
  }, [messages, sourcesData]);

  return (
    <div className="flex flex-row justify-center pb-20 h-dvh bg-white dark:bg-zinc-900">
      <div className="flex flex-col justify-between gap-4">
        <div
          ref={messagesContainerRef}
          className="flex flex-col gap-6 h-full w-dvw items-center overflow-y-scroll"
        >
          {messages.length === 0 && (
            <motion.div className="h-[350px] px-4 w-full md:w-[500px] md:px-0 pt-20">
              <div className="border rounded-lg p-6 flex flex-col gap-4 text-zinc-500 text-sm dark:text-zinc-400 dark:border-zinc-700">
                <p className="flex flex-row justify-center gap-4 items-center text-zinc-900 dark:text-zinc-50">
                  <VercelIcon size={16} />
                  <span>News Analysis Bot</span>
                  <MasonryIcon />
                </p>
                <p>
                  Ask questions about the latest news regarding Gautam Adani
                  case.
                </p>
              </div>
            </motion.div>
          )}

          {messages.map((message) => (
            <Message message={message} key={message.id} sources={sourcesData} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="grid sm:grid-cols-2 gap-2 w-full px-4 md:px-0 mx-auto md:max-w-[500px] mb-4">
          {messages.length === 0 &&
            suggestedActions.map((suggestedAction, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                key={index}
                className={index > 1 ? "hidden sm:block" : "block"}
              >
                <button
                  onClick={async () => {
                    append({
                      role: "user",
                      content: suggestedAction.action,
                    });
                  }}
                  className="w-full text-left border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 rounded-lg p-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex flex-col"
                >
                  <span className="font-medium">{suggestedAction.title}</span>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {suggestedAction.label}
                  </span>
                </button>
              </motion.div>
            ))}
        </div>

        {data.length === 0 && (
          <div className="flex justify-center mb-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              <Upload size={16} />
              {isUploading ? "Uploading..." : "Upload PDF"}
            </button>
          </div>
        )}

        <form
          className="flex flex-col gap-2 relative items-center"
          onSubmit={handleSubmit}
        >
          <input
            ref={inputRef}
            className="bg-zinc-100 rounded-md px-2 py-1.5 w-full outline-none dark:bg-zinc-700 text-zinc-800 dark:text-zinc-300 md:max-w-[500px] max-w-[calc(100dvw-32px)]"
            placeholder="Ask about the PDF content..."
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
            }}
          />
        </form>
      </div>
    </div>
  );
}
