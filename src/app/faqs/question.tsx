"use client"
import React, { useState } from "react";
import { faqData } from "@/app/faqs/data";
import Divider from "@/components/divider";
import { motion, AnimatePresence } from "framer-motion";

export default function QuestionSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
    return(
        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          {faqData.map((faq, index) => (
            <div key={index}>
              <div className="border py-6 sm:py-7 md:py-8 px-2 sm:px-3 md:px-4 lg:px-10">
                <button
                  className="w-full flex justify-between items-center cursor-pointer gap-4"
                  onClick={() => toggleFaq(index)}
                >
                  <p className="text-base sm:text-lg md:text-xl font-tamdan-regular text-left">
                    {faq.question}
                  </p>
                  <img
                    src="/icons/arrowDown.png"
                    alt="arrow"
                    className={`transform transition-transform flex-shrink-0 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Divider/>
                      <p className="text-sm sm:text-base md:text-lg mt-4 leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
    )
}