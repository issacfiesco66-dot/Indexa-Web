"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface FAQItemData {
  question: string;
  answer: string;
}

interface FAQItemProps extends FAQItemData {
  /** Extra classes for the outer wrapper */
  className?: string;
}

export default function FAQItem({ question, answer, className = "" }: FAQItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`border-b border-gray-200 last:border-b-0 ${className}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-indexa-blue"
        aria-expanded={open}
      >
        <span className="text-base font-semibold text-indexa-gray-dark sm:text-lg">
          {question}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indexa-blue/10 text-indexa-blue"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-gray-500 sm:text-base">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
