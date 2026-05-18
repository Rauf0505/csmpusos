"use client";

import { motion } from "framer-motion";
import { Bot, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        ul: ({ children }) => (
          <ul className="list-disc pl-5 my-1.5 space-y-0.5">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-5 my-1.5 space-y-0.5">{children}</ol>
        ),
        li: ({ children }) => <li className="text-[13px] leading-relaxed">{children}</li>,
        p: ({ children }) => <p className="text-[13px] leading-relaxed mb-1.5 last:mb-0">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        code: ({ children }) => (
          <code className="bg-gray-200/60 px-1.5 py-0.5 rounded text-[12px] font-mono">{children}</code>
        ),
        pre: ({ children }) => (
          <pre className="bg-gray-200/60 p-3 rounded-lg overflow-x-auto text-[12px] font-mono my-2">{children}</pre>
        ),
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
            {children}
          </a>
        ),
        h1: ({ children }) => <h1 className="text-base font-bold mt-3 mb-1.5">{children}</h1>,
        h2: ({ children }) => <h2 className="text-sm font-bold mt-2.5 mb-1">{children}</h2>,
        h3: ({ children }) => <h3 className="text-[13px] font-bold mt-2 mb-1">{children}</h3>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export function AiMessage({
  content,
  source,
}: {
  content: string;
  source?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-2.5 items-start"
    >
      <div className="w-7 h-7 rounded-full bg-primary shrink-0 flex items-center justify-center">
        <Bot size={14} className="text-white" />
      </div>
      <div className="flex-1 max-w-[75%]">
        <div
          className="text-[13px] leading-relaxed px-3.5 py-2.5 rounded-lg rounded-tl-[4px] [&_ul]:list-disc [&_ol]:list-decimal"
          style={{ background: "#f1f5f9", color: "#0f172a" }}
        >
          <MarkdownContent content={content} />
        </div>
        {source && (
          <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-muted-foreground">
            <FileText size={12} />
            <span>{source}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
