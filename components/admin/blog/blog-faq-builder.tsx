'use client';

import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface FAQItem {
  question: string;
  answer: string;
  sort_order: number;
}

interface BlogFAQBuilderProps {
  faqs: FAQItem[];
  onChange: (faqs: FAQItem[]) => void;
}

export function BlogFAQBuilder({ faqs, onChange }: BlogFAQBuilderProps) {
  const addFAQ = () => {
    onChange([...faqs, { question: '', answer: '', sort_order: faqs.length }]);
  };

  const removeFAQ = (index: number) => {
    onChange(faqs.filter((_, i) => i !== index).map((f, i) => ({ ...f, sort_order: i })));
  };

  const updateFAQ = (index: number, field: 'question' | 'answer', value: string) => {
    onChange(faqs.map((f, i) => (i === index ? { ...f, [field]: value } : f)));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-700">FAQ Section</label>
        <Button type="button" variant="outline" size="sm" onClick={addFAQ} className="gap-1.5 text-xs h-8">
          <Plus className="h-3.5 w-3.5" />
          Add FAQ
        </Button>
      </div>

      {faqs.length === 0 && (
        <p className="text-xs text-slate-400 py-4 text-center border border-dashed border-slate-200 rounded-lg">
          Add FAQs to boost SEO with FAQ schema markup
        </p>
      )}

      {faqs.map((faq, index) => (
        <div key={index} className="rounded-lg border border-slate-200 p-4 bg-white space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Q{index + 1}</span>
            <div className="flex-1">
              <Input
                value={faq.question}
                onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                placeholder="Enter question"
                className="h-9 text-sm border-slate-200"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeFAQ(index)}
              className="h-8 w-8 p-0 text-slate-400 hover:text-red-500"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Textarea
            value={faq.answer}
            onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
            placeholder="Enter answer"
            rows={2}
            className="text-sm border-slate-200 resize-none"
          />
        </div>
      ))}
    </div>
  );
}
