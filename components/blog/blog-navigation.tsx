'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Blog } from '@/lib/types';

interface BlogNavigationProps {
  prev?: Pick<Blog, 'slug' | 'title'> | null;
  next?: Pick<Blog, 'slug' | 'title'> | null;
}

export function BlogNavigation({ prev, next }: BlogNavigationProps) {
  if (!prev && !next) return null;

  return (
    <nav className="mt-12 pt-8 border-t border-slate-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {prev ? (
          <Link
            href={`/blogs/${prev.slug}`}
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-sky-200 hover:shadow-md"
          >
            <ChevronLeft className="h-5 w-5 text-slate-400 group-hover:text-sky-600 shrink-0 transition-colors" />
            <div className="min-w-0">
              <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Previous</span>
              <span className="text-sm font-medium text-slate-700 group-hover:text-sky-600 line-clamp-2 transition-colors">
                {prev.title}
              </span>
            </div>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            href={`/blogs/${next.slug}`}
            className="group flex items-center justify-end gap-3 rounded-xl border border-slate-200 bg-white p-4 text-right transition-all hover:border-sky-200 hover:shadow-md"
          >
            <div className="min-w-0">
              <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Next</span>
              <span className="text-sm font-medium text-slate-700 group-hover:text-sky-600 line-clamp-2 transition-colors">
                {next.title}
              </span>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-sky-600 shrink-0 transition-colors" />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </nav>
  );
}
