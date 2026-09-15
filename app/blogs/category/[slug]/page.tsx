import { getBlogsByCategory, getAllCategories, getAllTags } from '@/lib/blog/queries';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { FolderOpen, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BlogCard } from '@/components/blog/blog-card';
import { BlogSidebar } from '@/components/blog/blog-sidebar';
import { BlogNewsletter } from '@/components/blog/blog-newsletter';
import { BlogCTA } from '@/components/blog/blog-cta';

// ISR: Revalidate every 60 seconds
export const revalidate = 60;

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await getBlogsByCategory(params.slug, 1, 0);

  if (!category) {
    return { title: 'Category Not Found - Starlight Academy' };
  }

  return {
    title: `${category.name} Articles - Starlight Academy Blog`,
    description: category.description || `Browse ${category.name} articles, tips, and insights from Starlight Academy.`,
    openGraph: {
      title: `${category.name} - Starlight Academy Blog`,
      description: category.description || `Browse ${category.name} articles and insights.`,
      siteName: 'Starlight Academy',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.name} - Starlight Academy Blog`,
      description: category.description || `Browse ${category.name} articles and insights.`,
    },
    alternates: {
      canonical: `/blogs/category/${category.slug}`,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { blogs, category } = await getBlogsByCategory(params.slug, 12, 0);

  if (!category) {
    notFound();
  }

  const [allCategories, allTags] = await Promise.all([getAllCategories(), getAllTags()]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50/50 via-white to-slate-50/30">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 pb-12 pt-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link href="/blogs" className="inline-flex items-center gap-1 text-sm text-sky-200 hover:text-white transition-colors mb-4">
            <ArrowLeft className="h-3.5 w-3.5" />
            All Articles
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-sky-200 backdrop-blur-sm mb-3">
            <FolderOpen className="h-3.5 w-3.5" />
            Category
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{category.name}</h1>
          {category.description && (
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">{category.description}</p>
          )}
          <p className="mt-3 text-sm text-slate-400">{blogs.length} article{blogs.length !== 1 ? 's' : ''}</p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FolderOpen className="mb-4 h-12 w-12 text-slate-300" />
            <p className="text-lg text-slate-600 font-medium">No articles in this category yet</p>
            <p className="mt-2 text-sm text-slate-400">Check back soon for new content!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 py-10">
            <div className="grid gap-6 sm:grid-cols-2">
              {blogs.map(blog => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
            <BlogSidebar
              categories={allCategories}
              tags={allTags}
              recentBlogs={blogs.slice(0, 5)}
              activeCategory={category.slug}
            />
          </div>
        )}

        <BlogNewsletter />
        <div className="mt-12 mb-16">
          <BlogCTA />
        </div>
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `${category.name} Articles`,
            description: category.description,
            url: `https://vihaaneducation.com/blogs/category/${category.slug}`,
            isPartOf: {
              '@type': 'Blog',
              name: 'Starlight Academy Blog',
              url: 'https://vihaaneducation.com/blogs',
            },
          }),
        }}
      />
    </div>
  );
}
