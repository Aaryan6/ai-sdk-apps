"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="h-dvh w-full flex items-center justify-center">
      <div className="flex flex-col gap-4">
        <Link
          href="/stream-ui"
          className="px-4 py-2 border rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-center"
        >
          Stream UI
        </Link>
        <Link
          href="/use-pdf"
          className="px-4 py-2 border rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-center"
        >
          Use PDF
        </Link>
        <Link
          href="/search"
          className="px-4 py-2 border rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-center"
        >
          Search
        </Link>
        <Link
          href="/scrap-pdf"
          className="px-4 py-2 border rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-center"
        >
          Scrap PDF
        </Link>
      </div>
    </div>
  );
}
