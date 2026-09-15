'use client';

import { useState, useEffect, useRef } from 'react';
import { List } from 'lucide-react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface BlogTableOfContentsProps {
  content: string;
}

export function BlogTableOfContents({ content }: BlogTableOfContentsProps) {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const container = document.getElementById('blog-content');
    if (!container) return;

    const elements = container.querySelectorAll('h2, h3');
    const items: TOCItem[] = [];
    elements.forEach((el) => {
      const id = el.id || el.textContent?.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim() || '';
      if (!el.id) el.id = id;
      items.push({ id, text: el.textContent || '', level: parseInt(el.tagName[1]) });
    });
    setHeadings(items);

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -60% 0px' }
    );

    elements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, [content]);

  if (headings.length === 0) return null;

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <List className="h-4 w-4 text-slate-500" />
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Table of Contents</h3>
      </div>
      <nav className="space-y-1">
        {headings.map((heading) => (
          <button
            key={heading.id}
            onClick={() => handleClick(heading.id)}
            className={`block w-full text-left text-sm py-1.5 px-2 rounded-md transition-colors ${
              heading.level === 3 ? 'pl-6' : 'pl-2'
            } ${
              activeId === heading.id
                ? 'bg-sky-50 text-sky-700 font-medium'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            {heading.text}
          </button>
        ))}
      </nav>
    </div>
  );
}
