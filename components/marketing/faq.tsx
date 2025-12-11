"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  category: string;
  items: FAQItem[];
}

const faqData: FAQCategory[] = [
  {
    category: "How It Works",
    items: [
      {
        question: "I already have a Skybox address (Mailpac, Shipme, etc.). Why should I switch to SendCat?",
        answer: "Most freight forwarders only provide a shipping address. SendCat is a full AI shopping concierge. We search multiple stores (eBay, Amazon, etc.) for you, estimate your total landed cost (including duties & GCT) upfront, and handle the purchase if you don't have a US credit card. Plus, our tracking is more transparent.",
      },
      {
        question: "Can I use my own US credit card and just use your shipping address?",
        answer: "Yes! You can use SendCat purely for our smart logistics. We'll give you a free US address in Miami. When you ship items there, we'll notify you, handle the customs clearance, and deliver it to your door or parish pickup point.",
      },
      {
        question: "Does SendCat really handle Customs Duties and GCT for me?",
        answer: "Absolutely. We calculate these fees before you pay, so there are no surprises when the item arrives in Jamaica. We clear the goods through customs on your behalf and include the cost in your final invoice.",
      },
    ],
  },
  {
    category: "Shipping & Delivery",
    items: [
      {
        question: "How long does shipping take to reach Jamaica?",
        answer: "Once your item arrives at our Miami warehouse, it typically takes 3-5 business days to clear customs and be ready for delivery in Kingston. Rural deliveries may take 1-2 extra days.",
      },
      {
        question: "Do you deliver to all parishes?",
        answer: "Yes, we offer island-wide delivery. We have direct courier partners for Kingston, St. Andrew, and St. Catherine, and we use Knutsford Express or Zipmail for other parishes.",
      },
      {
        question: "What happens if my package gets lost or damaged?",
        answer: "We offer insurance options for all shipments. If an item is lost or damaged while in our custody (from Miami warehouse to your door), we cover the cost. We also help you file claims with the original seller if it arrived damaged at our hub.",
      },
    ],
  },
  {
    category: "Pricing & Payments",
    items: [
      {
        question: "What are your freight rates?",
        answer: "Our rates are competitive with standard market rates, starting at roughly $4.50 USD per lb. Heavy items may qualify for discounted volume rates. Use our AI calculator to get an exact quote before you ship.",
      },
      {
        question: "Can I pay in Jamaican Dollars (JMD)?",
        answer: "Yes! We accept both USD and JMD via credit/debit card or bank transfer. The exchange rate is determined daily based on bank rates.",
      },
      {
        question: "Is there a membership fee?",
        answer: "No, signing up for SendCat and getting a US address is completely free. We do plan to offer a Premium Membership in the future for frequent shippers, which will include discounted rates and faster processing.",
      },
    ],
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<string | null>("How It Works-0");

  const toggleFAQ = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 md:py-32" id="faq">
      <div className="mb-20 text-center">
        <h2 className="text-3xl md:text-5xl font-medium text-white tracking-tight">
          Answers with structure
        </h2>
      </div>

      <div className="border-t border-white/10">
        {faqData.map((section, sectionIndex) => (
          <div key={sectionIndex} className="grid grid-cols-1 md:grid-cols-12 py-8 border-b border-white/10 gap-8 md:gap-0">
            {/* Category Name (Left Column) */}
            <div className="md:col-span-4 lg:col-span-3">
              <h3 className="text-lg font-medium text-zinc-300 sticky top-24">
                {section.category}
              </h3>
            </div>

            {/* Questions (Right Column) */}
            <div className="md:col-span-8 lg:col-span-9 space-y-6">
              {section.items.map((item, itemIndex) => {
                const id = `${section.category}-${itemIndex}`;
                const isOpen = openIndex === id;

                return (
                  <div key={itemIndex} className="group">
                    <button
                      onClick={() => toggleFAQ(id)}
                      className="flex w-full items-start justify-between text-left gap-4"
                    >
                      <span className={cn(
                        "text-lg font-medium transition-colors",
                        isOpen ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
                      )}>
                        {item.question}
                      </span>
                      <span className="flex-shrink-0 mt-1">
                        {isOpen ? (
                          <X className="h-5 w-5 text-white" />
                        ) : (
                          <Plus className="h-5 w-5 text-zinc-500 group-hover:text-white transition-colors" />
                        )}
                      </span>
                    </button>
                    
                    <div 
                      className={cn(
                        "overflow-hidden transition-all duration-300 ease-in-out",
                        isOpen ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0"
                      )}
                    >
                      <p className="text-zinc-400 leading-relaxed pr-12 text-base">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

