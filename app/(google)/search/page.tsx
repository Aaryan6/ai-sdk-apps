"use client";

import { Message } from "@/components/message";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { useChat } from "ai/react";
import { motion } from "framer-motion";
import { useRef } from "react";

export default function Home() {
  const { messages, handleSubmit, input, setInput, append } = useChat({
    api: "/api/search",
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

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
                <p>
                  The maxSteps parameter of streamText function allows you to
                  automatically handle multiple tool calls in sequence using the
                  AI SDK in your application.
                </p>
                <p> Learn more about from the Vercel AI SDK.</p>
              </div>
            </motion.div>
          )}

          {messages.map((message) => (
            <Message
              key={message.id}
              role={message.role}
              content={message.content}
              toolInvocations={message.toolInvocations}
            ></Message>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form
          className="flex flex-col gap-2 relative items-center"
          onSubmit={handleSubmit}
        >
          <input
            ref={inputRef}
            className="bg-zinc-100 rounded-md px-2 py-1.5 w-full outline-none dark:bg-zinc-700 text-zinc-800 dark:text-zinc-300 md:max-w-[500px] max-w-[calc(100dvw-32px)]"
            placeholder="Send a message..."
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
