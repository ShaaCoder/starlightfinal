import { getBlogBySlug, getRelatedBlogs, getAllCategories, getAllTags, getPublishedBlogs } from '@/lib/blog/queries';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Calendar, Clock, User, ArrowLeft, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BlogCard } from '@/components/blog/blog-card';
import { BlogTableOfContents } from '@/components/blog/blog-table-of-contents';
import { BlogFAQSection } from '@/components/blog/blog-faq-section';
import { BlogShareButtons } from '@/components/blog/blog-share-buttons';
import { BlogNavigation } from '@/components/blog/blog-navigation';
import { BlogNewsletter } from '@/components/blog/blog-newsletter';
import { BlogCTA } from '@/components/blog/blog-cta';
import type {
  BlogTag,
  BlogCategory,
  BlogFAQ,
} from '@/lib/types';

// ISR: Revalidate every 60 seconds
export const revalidate = 60;

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const blog = await getBlogBySlug(params.slug);

  if (!blog) {
    return { title: 'Blog Not Found - Starlight Academy' };
  }

  const metaTitle = blog.meta_title || `${blog.title} - Starlight Academy`;
  const metaDescription = blog.meta_description || blog.excerpt || blog.content.replace(/<[^>]*>/g, '').slice(0, 160);
  const ogImage = blog.og_image || blog.featured_image;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: [
      blog.title,
      blog.author,
      'education',
      'blog',
      ...(blog.focus_keyword ? [blog.focus_keyword] : []),
     ...(blog.tags?.map((t: BlogTag) => t.name) || []),
      'Starlight Academy',
    ],
    authors: [{ name: blog.author }],
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: 'article',
      publishedTime: blog.created_at,
      modifiedTime: blog.updated_at,
      authors: [blog.author],
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: blog.image_alt || blog.title }] : [],
      siteName: 'Starlight Academy',
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: ogImage ? [ogImage] : [],
    },
    alternates: {
      canonical: blog.canonical_url || `/blogs/${blog.slug}`,
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const blog = await getBlogBySlug(params.slug);

  if (!blog) {
    notFound();
  }

  const relatedBlogs = await getRelatedBlogs(blog.id, 3);
  const allBlogs = await getPublishedBlogs(50, 0);

  const currentIdx = allBlogs.findIndex(b => b.id === blog.id);
  const prevBlog = currentIdx > 0 ? allBlogs[currentIdx - 1] : null;
  const nextBlog = currentIdx < allBlogs.length - 1 ? allBlogs[currentIdx + 1] : null;

  const readingTime = blog.reading_time || Math.max(1, Math.ceil(blog.content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200));
  const formattedDate = new Date(blog.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const updatedDate = new Date(blog.updated_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50/30 to-white">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="pt-6 sm:pt-8" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-sm text-slate-500 flex-wrap" suppressHydrationWarning>
            <li><Link href="/" className="hover:text-sky-600 transition-colors">Home</Link></li>
            <li><span className="mx-1">/</span></li>
            <li><Link href="/blogs" className="hover:text-sky-600 transition-colors">Blog</Link></li>
            {blog.categories?.[0] && (
              <>
                <li><span className="mx-1">/</span></li>
                <li>
                  <Link href={`/blogs/category/${blog.categories[0].slug}`} className="hover:text-sky-600 transition-colors">
                    {blog.categories[0].name}
                  </Link>
                </li>
              </>
            )}
            <li><span className="mx-1">/</span></li>
            <li className="text-slate-800 font-medium truncate max-w-[200px]">{blog.title}</li>
          </ol>
        </nav>

        {/* Hero Image */}
        <div className="mt-6 sm:mt-8 relative h-64 sm:h-80 lg:h-[480px] w-full overflow-hidden rounded-2xl shadow-xl">
          {blog.featured_image ? (
            <Image
              src={blog.featured_image}
              alt={blog.image_alt || blog.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 via-sky-50 to-cyan-50">
              <div className="text-7xl opacity-20">&#9998;</div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8">
            {blog.categories?.map((cat: BlogCategory) => (
              <Badge key={cat.id} className="bg-sky-600 text-white hover:bg-sky-700 text-xs mb-3">
                {cat.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Content + TOC Layout */}
        <div className="mt-8 lg:mt-12 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 lg:gap-12">
          {/* Article Content */}
          <article className="min-w-0">
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm p-6 sm:p-8 lg:p-12">
              {/* Meta */}
              <div className="mb-5 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5 text-sky-600 font-medium">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={blog.created_at}>{formattedDate}</time>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {readingTime} min read
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {blog.author || 'Vihaan Academy'}
                </span>
                {blog.views > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Eye className="h-4 w-4" />
                    {blog.views} views
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight mb-5">
                {blog.title}
              </h1>

              {/* Tags + Share */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-8 pb-6 border-b border-slate-100">
                <div className="flex flex-wrap gap-1.5">
                 {blog.tags?.map((tag: BlogTag) => (
                    <Link key={tag.id} href={`/blogs/tag/${tag.slug}`}>
                      <Badge variant="outline" className="text-xs text-slate-500 border-slate-200 hover:bg-slate-50 cursor-pointer">
                        {tag.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
                <BlogShareButtons title={blog.title} slug={blog.slug} />
              </div>

              {/* Author Card */}
              <div className="mb-8 flex items-center gap-3 rounded-xl bg-gradient-to-r from-sky-50 to-slate-50 p-4 border border-sky-100/50">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-600 shadow-md">
                  <span className="text-xs font-bold text-white">
                  {(blog.author || 'VA')
  .split(' ')
  .map((n: string) => n[0])
  .join('')
  .slice(0, 2)
  .toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 text-sm">{blog.author || 'Vihaan Academy'}</p>
                  <p className="text-xs text-slate-500">Starlight Academy</p>
                </div>
              </div>

              {/* Content */}
              <div
                id="blog-content"
                className="prose prose-slate max-w-none
                  prose-headings:scroll-mt-24
                  prose-h2:text-2xl prose-h2:font-bold prose-h2:text-slate-900 prose-h2:mt-10 prose-h2:mb-4
                  prose-h3:text-xl prose-h3:font-semibold prose-h3:text-slate-800 prose-h3:mt-8 prose-h3:mb-3
                  prose-p:text-slate-700 prose-p:leading-relaxed prose-p:text-[15px]
                  prose-a:text-sky-600 prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-slate-900
                  prose-ul:my-4 prose-ol:my-4
                  prose-li:text-slate-700 prose-li:text-[15px]
                  prose-blockquote:border-sky-300 prose-blockquote:bg-sky-50/50 prose-blockquote:rounded-r-lg prose-blockquote:py-3 prose-blockquote:px-5
                  prose-img:rounded-xl prose-img:shadow-md
                  prose-code:text-sky-700 prose-code:bg-sky-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                  prose-pre:bg-slate-900 prose-pre:rounded-xl"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />

              {/* FAQ Section */}
              {blog.faqs && blog.faqs.length > 0 && (
                <BlogFAQSection faqs={blog.faqs} />
              )}

              {/* Bottom */}
              <div className="mt-10 pt-6 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="text-sm text-slate-500">
                    Last updated on {updatedDate}
                  </div>
                  <Link href="/blogs">
                    <button className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors">
                      <ArrowLeft className="h-4 w-4" />
                      All Articles
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Previous/Next Navigation */}
            <BlogNavigation prev={prevBlog} next={nextBlog} />
          </article>

          {/* Table of Contents Sidebar */}
          <div className="hidden lg:block">
            <BlogTableOfContents content={blog.content} />
          </div>
        </div>

        {/* Related Blogs */}
        {relatedBlogs.length > 0 && (
          <section className="py-12 sm:py-16 lg:py-20">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">
              Related <span className="text-sky-600">Articles</span>
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedBlogs.map(related => (
                <BlogCard key={related.id} blog={related} />
              ))}
            </div>
          </section>
        )}

        {/* Newsletter */}
        <BlogNewsletter />

        {/* CTA */}
        <div className="mt-12 mb-16">
          <BlogCTA />
        </div>
      </main>

      {/* JSON-LD Article Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: blog.title,
            description: blog.meta_description || blog.excerpt,
            image: blog.featured_image || blog.og_image,
            author: {
              '@type': 'Person',
              name: blog.author || 'Vihaan Academy',
            },
            publisher: {
              '@type': 'Organization',
              name: 'Starlight Academy',
              logo: {
                '@type': 'ImageObject',
                url: 'https://vihaaneducation.com/vihaanlogo.png',
              },
            },
            datePublished: blog.created_at,
            dateModified: blog.updated_at,
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `https://vihaaneducation.com/blogs/${blog.slug}`,
            },
            ...(blog.faqs && blog.faqs.length > 0
              ? {
                  hasPart: {
                    '@type': 'FAQPage',
                    mainEntity: blog.faqs.map((faq: BlogFAQ) => ({
                      '@type': 'Question',
                      name: faq.question,
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: faq.answer,
                      },
                    })),
                  },
                }
              : {}),
          }),
        }}
      />

      {/* JSON-LD Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://vihaaneducation.com' },
              { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://vihaaneducation.com/blogs' },
              ...(blog.categories?.[0]
                ? [{ '@type': 'ListItem', position: 3, name: blog.categories[0].name, item: `https://vihaaneducation.com/blogs/category/${blog.categories[0].slug}` }]
                : []),
              { '@type': 'ListItem', position: blog.categories?.[0] ? 4 : 3, name: blog.title },
            ],
          }),
        }}
      />
    </div>
  );
}
