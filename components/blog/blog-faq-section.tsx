'use client';

import { ChevronDown } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { BlogFAQ } from '@/lib/types';

interface BlogFAQSectionProps {
  faqs: BlogFAQ[];
}

export function BlogFAQSection({ faqs }: BlogFAQSectionProps) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="mt-12 pt-10 border-t border-slate-200">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="space-y-3">
        {faqs.map((faq, index) => (
          <AccordionItem
            key={faq.id}
            value={`faq-${index}`}
            className="border border-slate-200 rounded-xl px-5 data-[state=open]:border-sky-200 data-[state=open]:bg-sky-50/30 transition-colors"
          >
            <AccordionTrigger className="text-left text-sm font-semibold text-slate-800 hover:text-sky-600 py-4 hover:no-underline">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-slate-600 leading-relaxed pb-4">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
