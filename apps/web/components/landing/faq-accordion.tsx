"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
    q: string;
    a: string;
}

interface FaqAccordionProps {
    items: FAQItem[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <div className="space-y-4">
            {items.map((item, idx) => (
                <div 
                    key={idx} 
                    className="border border-border/60 rounded-xl bg-card overflow-hidden transition-all duration-300"
                >
                    <button
                        onClick={() => toggleFaq(idx)}
                        className="w-full px-6 py-5 text-left font-semibold text-sm md:text-base flex items-center justify-between hover:bg-muted/30 transition-colors"
                    >
                        <span>{item.q}</span>
                        <ChevronDown className={`size-4.5 text-muted-foreground shrink-0 transition-transform duration-300 ${openFaq === idx ? "rotate-180" : ""}`} />
                    </button>
                    
                    <div className={`transition-all duration-300 overflow-hidden ${openFaq === idx ? "max-h-[200px]" : "max-h-0"}`}>
                        <div className="px-6 pb-5 text-xs md:text-sm text-muted-foreground border-t border-border/20 pt-4 leading-relaxed">
                            {item.a}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
