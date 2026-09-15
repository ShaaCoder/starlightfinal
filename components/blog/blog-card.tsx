'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Blog } from '@/lib/types';

interface BlogCardProps {
  blog: Blog;
  variant?: 'default' | 'featured' | 'compact';
}

export function BlogCard({ blog, variant = 'default' }: BlogCardProps) {
  const primaryCategory = blog.categories?.[0];
  const readingTime = blog.reading_time || Math.max(1, Math.ceil(blog.content.split(/\s+/).length / 200));
  const formattedDate = new Date(blog.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const excerpt = blog.excerpt || blog.content.replace(/<[^>]*>/g, '').slice(0, 160);

  if (variant === 'featured') {
    return (
      <Link href={`/blogs/${blog.slug}`} className="group block">
        <Card className="overflow-hidden border-gray-200/60 bg-white transition-all duration-300 hover:shadow-2xl hover:border-gray-300 shadow-card">
          <div className="grid lg:grid-cols-2">
            <div className="relative h-72 sm:h-80 lg:h-full lg:min-h-[440px] w-full overflow-hidden">
              {blog.featured_image ? (
                <Image
                  src={blog.featured_image}
                  alt={blog.image_alt || blog.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-red-100">
                  <div className="text-6xl opacity-20">&#9998;</div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-black/5" />
              <div className="absolute top-4 left-4">
                <Badge className="bg-gradient-to-r from-blue-600 to-red-600 text-white hover:opacity-90 shadow-lg text-xs font-semibold">
                  Featured
                </Badge>
              </div>
              {primaryCategory && (
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-white/90 text-gray-700 backdrop-blur-sm text-xs">
                    {primaryCategory.name}
                  </Badge>
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
              <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                {formattedDate && (
                  <span className="inline-flex items-center gap-1.5 text-blue-600 font-medium">
                    <Calendar className="h-3.5 w-3.5" />
                    {formattedDate}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {readingTime} min read
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-3 leading-tight">
                {blog.title}
              </h2>
              <p className="text-gray-600 mb-5 line-clamp-3 text-sm sm:text-base leading-relaxed">
                {excerpt}
              </p>
              {blog.tags && blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {blog.tags.slice(0, 3).map(tag => (
                    <Badge key={tag.id} variant="outline" className="text-xs text-gray-500 border-gray-200">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-red-100">
                    <User className="h-4 w-4 text-blue-700" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700 block">{blog.author || 'Vihaan Academy'}</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:gap-2 transition-all">
                  Read Article <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link href={`/blogs/${blog.slug}`} className="group block">
        <div className="flex gap-4 py-3 border-b border-gray-100 last:border-0">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
            {blog.featured_image ? (
              <Image src={blog.featured_image} alt={blog.image_alt || blog.title} fill className="object-cover" sizes="64px" />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-blue-50 to-red-50" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
              {blog.title}
            </h4>
            <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
              <span>{formattedDate}</span>
              <span>{readingTime} min</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/blogs/${blog.slug}`} className="group block">
      <Card className="flex h-full flex-col overflow-hidden border-gray-200/60 bg-white transition-all duration-300 hover:shadow-xl hover:border-gray-300 shadow-card card-hover">
        <div className="relative h-52 w-full overflow-hidden">
          {blog.featured_image ? (
            <Image
              src={blog.featured_image}
              alt={blog.image_alt || blog.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-red-100">
              <div className="text-4xl opacity-20">&#9998;</div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            {primaryCategory && (
              <Badge variant="secondary" className="bg-white/90 text-gray-700 backdrop-blur-sm text-xs">
                {primaryCategory.name}
              </Badge>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-gray-600 backdrop-blur-sm">
              <Calendar className="h-3 w-3" />
              {formattedDate}
            </span>
          </div>
        </div>
        <CardContent className="flex flex-1 flex-col p-5">
          <h3 className="text-base font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
            {blog.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">{excerpt}</p>
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {blog.tags.slice(0, 2).map(tag => (
                <Badge key={tag.id} variant="outline" className="text-[11px] text-gray-500 border-gray-200 px-1.5 py-0">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
          <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <User className="h-3 w-3" />
              <span>{blog.author || 'Vihaan Academy'}</span>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
              <Clock className="h-3 w-3" />
              {readingTime} min
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
