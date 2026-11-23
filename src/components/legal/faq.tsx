"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How long does delivery take?",
    answer: "Orders are delivered within 3–8 business days after dispatch.",
  },
  {
    question: "Can I cancel my order?",
    answer:
      "Orders can be cancelled before shipment. Once shipped, cancellation is not allowed.",
  },
  {
    question: "What is your return policy?",
    answer: "Return requests must be raised within 24 hours of delivery.",
  },
  {
    question: "How is GST calculated?",
    answer:
      "For intra-state orders, CGST 2.5% + SGST 2.5%. For inter-state, IGST 5%.",
  },
];

const FAQ: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl sm:text-4xl font-futura-bold text-gray-900 mb-8">
          Frequently Asked Questions
        </h1>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = activeIndex === index;

            return (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden transition"
              >
                {/* Question Row */}
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition"
                >
                  <span className="font-medium text-gray-900">
                    {faq.question}
                  </span>

                  <ChevronDown
                    className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Answer */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-4 text-gray-600 text-sm sm:text-base">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
