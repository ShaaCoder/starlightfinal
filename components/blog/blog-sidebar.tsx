'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { BlogCategory, BlogTag, Blog } from '@/lib/types';
import { BlogCard } from './blog-card';

interface BlogSidebarProps {
  categories: BlogCategory[];
  tags: BlogTag[];
  recentBlogs: Blog[];
  activeCategory?: string;
  activeTag?: string;
}

export function BlogSidebar({ categories, tags, recentBlogs, activeCategory, activeTag }: BlogSidebarProps) {
  return (
    <aside className="space-y-8">
      {/* Categories */}
      {categories.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Categories</h3>
          <div className="space-y-1.5">
            <Link
              href="/blogs"
              className={`block text-sm px-3 py-2 rounded-lg transition-colors ${
                !activeCategory && !activeTag
                  ? 'bg-sky-50 text-sky-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              All Articles
            </Link>
            {categories.map(cat => (
              <Link
                key={cat.id}
                href={`/blogs/category/${cat.slug}`}
                className={`block text-sm px-3 py-2 rounded-lg transition-colors ${
                  activeCategory === cat.slug
                    ? 'bg-sky-50 text-sky-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Popular Tags</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <Link key={tag.id} href={`/blogs/tag/${tag.slug}`}>
                <Badge
                  variant={activeTag === tag.slug ? 'default' : 'outline'}
                  className={`text-xs cursor-pointer transition-colors ${
                    activeTag === tag.slug
                      ? 'bg-sky-600 text-white hover:bg-sky-700'
                      : 'text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  {tag.name}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Posts */}
      {recentBlogs.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Recent Posts</h3>
          <div className="divide-y divide-slate-100">
            {recentBlogs.slice(0, 5).map(blog => (
              <BlogCard key={blog.id} blog={blog} variant="compact" />
            ))}
          </div>
        </div>
      )}

      {/* Newsletter CTA */}
      <div className="rounded-xl bg-gradient-to-br from-sky-600 to-sky-700 p-6 text-white">
        <h3 className="text-lg font-bold mb-2">Stay Updated</h3>
        <p className="text-sm text-sky-100 mb-4 leading-relaxed">
          Get the latest educational insights, study tips, and academy news delivered to your inbox.
        </p>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
          <input
            type="email"
            placeholder="Your email address"
            className="w-full h-10 px-3 rounded-lg bg-white/15 border border-white/20 text-white placeholder:text-sky-200 text-sm focus:outline-none focus:border-white/50 focus:bg-white/20"
          />
          <button
            type="submit"
            className="w-full h-10 rounded-lg bg-white text-sky-700 font-semibold text-sm hover:bg-sky-50 transition-colors"
          >
            Subscribe
          </button>
        </form>
      </div>
    </aside>
  );
}
