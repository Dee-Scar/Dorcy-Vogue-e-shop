"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { CartDrawer } from "@/components/CartDrawer";
import { ChevronDown, Loader2, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface FAQQuestion {
  id: number;
  question: string;
  answer: string;
}

interface FAQSection {
  id: number;
  title: string;
  questions: FAQQuestion[];
}

// Hardcoded fallback in case CMS has no FAQ data yet
const FALLBACK_FAQS: FAQSection[] = [
  {
    id: 1,
    title: "Delivery Questions",
    questions: [
      {
        id: 11,
        question: "How long does delivery take?",
        answer: "Delivery takes 2-5 business days within Kaduna. Our rider will call before coming.",
      },
      {
        id: 12,
        question: "Can I track my delivery?",
        answer: "Yes, you can track your order on the Track Order page using your order reference number.",
      },
    ],
  },
  {
    id: 2,
    title: "Payment Information",
    questions: [
      {
        id: 21,
        question: "What payment methods do you accept?",
        answer: "We accept bank transfers. After placing your order, bank details will be displayed for you to make payment.",
      },
      {
        id: 22,
        question: "How long does payment verification take?",
        answer: "Verification is typically reviewed within 1-2 hours of uploading your receipt.",
      },
    ],
  },
  {
    id: 3,
    title: "Return Policy",
    questions: [
      {
        id: 31,
        question: "Can I return an item?",
        answer: "Items can be returned within 7 days of delivery if unused and in original packaging. Contact us via WhatsApp to initiate a return.",
      },
    ],
  },
];

function FAQAccordion({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQQuestion;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-[#1C1512]/5 rounded-xl overflow-hidden bg-white shadow-sm">
      <button
        onClick={onToggle}
        className="w-full py-4 px-5 flex items-center justify-between text-left font-sans text-sm sm:text-base font-bold text-[#1C1512] hover:text-[#B78A62] transition-colors cursor-pointer select-none"
      >
        <span>{item.question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-[#8C8682] flex-shrink-0 ml-3"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="px-5 pb-5 pt-1.5 font-sans text-xs sm:text-sm text-[#8C8682] leading-relaxed border-t border-[#1C1512]/5 bg-[#FAF7F2]/30 font-semibold">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FAQPageContent() {
  const [faqSections, setFaqSections] = useState<FAQSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadFAQ() {
      try {
        const { data } = await supabase
          .from("cms_settings")
          .select("faq_sections")
          .eq("id", 1)
          .single();

        const sections: FAQSection[] = data?.faq_sections || [];

        // Filter to only sections that have at least one question
        const validSections = sections.filter(
          (s) => s.questions && s.questions.length > 0
        );

        if (validSections.length > 0) {
          setFaqSections(validSections);
          // Default open first question of each section
          const defaults: Record<string, boolean> = {};
          validSections.forEach((s) => {
            if (s.questions[0]) defaults[`${s.id}-${s.questions[0].id}`] = true;
          });
          setOpenItems(defaults);
        } else {
          // Use fallback data
          setFaqSections(FALLBACK_FAQS);
          const defaults: Record<string, boolean> = {};
          FALLBACK_FAQS.forEach((s) => {
            if (s.questions[0]) defaults[`${s.id}-${s.questions[0].id}`] = true;
          });
          setOpenItems(defaults);
        }
      } catch {
        setFaqSections(FALLBACK_FAQS);
      } finally {
        setLoading(false);
      }
    }
    loadFAQ();
  }, []);

  const toggleItem = (sectionId: number, questionId: number) => {
    const key = `${sectionId}-${questionId}`;
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center pt-[80px] bg-[#FAF7F2] min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#B78A62]" />
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col pt-[80px] bg-[#FAF7F2] min-h-screen">
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow space-y-10">

        {/* Page Title */}
        <div className="text-center space-y-2">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1512] tracking-wide">
            Frequently Asked Questions
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#8C8682] max-w-md mx-auto">
            Find answers to common questions about orders, payments, and delivery
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-10">
          {faqSections.map((section) => (
            <div key={section.id} className="space-y-4">
              {/* Section Header */}
              <div className="bg-[#FAF7F2] border border-[#1C1512]/10 rounded-xl p-4 flex items-center space-x-3 shadow-sm">
                <div className="p-2 bg-white rounded-lg shadow-sm border border-[#1C1512]/5">
                  <HelpCircle className="h-5 w-5 text-[#B78A62]" />
                </div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#1C1512]">
                  {section.title}
                </h3>
              </div>

              {/* Questions */}
              <div className="space-y-3 sm:pl-2">
                {(section.questions || []).map((item) => (
                  <FAQAccordion
                    key={item.id}
                    item={item}
                    isOpen={!!openItems[`${section.id}-${item.id}`]}
                    onToggle={() => toggleItem(section.id, item.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

      </main>

      <CartDrawer onCheckout={() => {}} />
    </div>
  );
}

export default function FAQPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col pt-[80px] bg-[#FAF7F2] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#B78A62]" />
        </div>
      }
    >
      <Navbar />
      <FAQPageContent />
      <CartDrawer onCheckout={() => {}} />
    </Suspense>
  );
}
