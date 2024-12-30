"use client";

import { BotIcon, UserIcon } from "@/components/icons";
import { Markdown } from "@/components/markdown";
import { ToolInvocation } from "ai";
import { motion } from "framer-motion";
import { ReactNode } from "react";

export const Message = ({
  message,
  sources,
}: {
  message: {
    role: string;
    content: string | ReactNode;
    toolInvocations?: Array<ToolInvocation>;
    annotations?: any;
    id?: string;
  };
  sources?: Array<any>;
}) => {
  return (
    message.content && (
      <motion.div
        className={`flex whitespace-pre-wrap flex-row gap-4 px-4 w-full md:w-[500px] md:px-0 first-of-type:pt-20`}
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="size-[24px] flex flex-col justify-center items-center flex-shrink-0 text-zinc-400">
          {message.role === "assistant" ? <BotIcon /> : <UserIcon />}
        </div>

        <div className="flex flex-col gap-6 w-full">
          {message.content && (
            <div className="text-zinc-800 dark:text-zinc-300 flex flex-col gap-4">
              <Markdown>{message.content as string}</Markdown>
            </div>
          )}

          {message.annotations &&
            message.annotations[0]?.links &&
            message.annotations[0].links.length > 0 && (
              <div className="flex flex-col gap-2 text-sm">
                <p className="text-zinc-500 dark:text-zinc-400">Sources:</p>
                {message.annotations[0].links?.map(
                  (link: string, index: number) => (
                    <div key={index}>
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 break-all bg-zinc-800 p-2 py-1 rounded-md"
                      >
                        {link.split("https://")[1].slice(0, 50) + "..."}
                      </a>
                    </div>
                  )
                )}
              </div>
            )}
        </div>
        {/* {JSON.stringify(message, null, 2)} */}
        {/* {JSON.stringify(sources, null, 2)} */}
        {/* {JSON.stringify(message.annotations, null, 2)} */}
      </motion.div>
    )
  );
};
