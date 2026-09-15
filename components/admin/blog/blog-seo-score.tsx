'use client';

import { Check, X, CircleAlert as AlertCircle } from 'lucide-react';
import type { SEOScore } from '@/types/blog';

interface BlogSEOScoreProps {
  seoScore: SEOScore;
}

const checkLabels: Record<string, { label: string; weight: string }> = {
  keyword_in_title: { label: 'Focus keyword in title', weight: 'High' },
  keyword_in_description: { label: 'Focus keyword in meta description', weight: 'High' },
  slug_optimized: { label: 'Slug is SEO-friendly', weight: 'Medium' },
  heading_structure: { label: 'Proper heading structure', weight: 'High' },
  image_alt_present: { label: 'Image alt text provided', weight: 'Medium' },
  content_length_ok: { label: 'Content length sufficient (300+)', weight: 'Medium' },
  faq_present: { label: 'FAQ section included', weight: 'Medium' },
  meta_title_length: { label: 'Meta title (30-60 chars)', weight: 'High' },
  meta_description_length: { label: 'Meta description (120-160 chars)', weight: 'High' },
  excerpt_present: { label: 'Excerpt provided', weight: 'Low' },
};

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-red-600';
}

function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-50 border-emerald-200';
  if (score >= 60) return 'bg-amber-50 border-amber-200';
  return 'bg-red-50 border-red-200';
}

function getBarColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-red-500';
}

export function BlogSEOScore({ seoScore }: BlogSEOScoreProps) {
  const { score, checks } = seoScore;
  const passed = Object.values(checks).filter(Boolean).length;
  const total = Object.values(checks).length;

  return (
    <div className={`rounded-xl border p-5 ${getScoreBg(score)}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">SEO Score</h3>
        <span className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}%</span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 rounded-full bg-white/50 mb-5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getBarColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>

      <div className="space-y-2.5">
        {Object.entries(checks).map(([key, passed]) => {
          const config = checkLabels[key];
          return (
            <div key={key} className="flex items-start gap-2.5">
              {passed ? (
                <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <X className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <span className={`text-xs font-medium ${passed ? 'text-slate-700' : 'text-slate-500'}`}>
                  {config.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-white/30 text-xs text-slate-500">
        {passed} of {total} checks passed
      </div>
    </div>
  );
}
