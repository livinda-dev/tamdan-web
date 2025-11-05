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
        <div className="space-y-8">
          {faqData.map((faq, index) => (
            <div key={index}>
              <div className="border py-[29px] px-[90px]">
                <button
                  className="w-full flex justify-between items-center cursor-pointer"
                  onClick={() => toggleFaq(index)}
                >
                  <p className="text-[20px] font-tamdan-bold">
                    {faq.question}
                  </p>
                  <img
                    src="/icons/arrowDown.png"
                    alt="arrow"
                    className={`transform transition-transform ${
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
                      <p className="text-[16px] mt-2">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
    )
}