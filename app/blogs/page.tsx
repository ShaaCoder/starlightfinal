import {
  getPublishedBlogs,
  getFeaturedBlog,
  getAllCategories,
  getAllTags,
} from '@/lib/blog/queries';

import {
  BookOpen,
  TrendingUp,
  GraduationCap,
  FileText,
  Laptop,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { Metadata } from 'next';

import { BlogCard } from '@/components/blog/blog-card';
import { BlogSidebar } from '@/components/blog/blog-sidebar';
import { BlogNewsletter } from '@/components/blog/blog-newsletter';
import { BlogCTA } from '@/components/blog/blog-cta';

// ISR: Revalidate every 60 seconds
export const revalidate = 60;

/* =========================================================
   SEO METADATA
========================================================= */

export const metadata: Metadata = {
  title:
    'Starlight Academy Blog | Competitive Exams, NIOS & Education',
  description:
    'Read the latest educational updates, competitive exam preparation tips, NIOS and Open Schooling guidance, study strategies, computer education and career-related insights from Starlight Academy.',
  keywords: [
    'Starlight Academy blog',
    'education blog',
    'competitive exam preparation',
    'government exam preparation',
    'SSC preparation',
    'CGL preparation',
    'CHSL preparation',
    'Delhi Police preparation',
    'bank exam preparation',
    'CTET preparation',
    'DSSSB preparation',
    'KVS preparation',
    'NVS preparation',
    'NIOS updates',
    'NIOS admission',
    'NIOS study tips',
    'Open Schooling',
    'Class 10 study tips',
    'Class 12 study tips',
    'computer courses',
    'career guidance',
    'study tips',
    'exam preparation strategies',
    'Starlight Academy Delhi',
  ],
  openGraph: {
    title:
      'Starlight Academy Blog | Competitive Exams, NIOS & Education',
    description:
      'Educational updates, exam preparation strategies, NIOS guidance, Open Schooling information and study resources from Starlight Academy.',
    siteName: 'Starlight Academy',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'Starlight Academy Blog | Competitive Exams & Education',
    description:
      'Study tips, exam preparation strategies, NIOS guidance and educational updates from Starlight Academy.',
  },
  alternates: {
    canonical: '/blogs',
  },
};

/* =========================================================
   PAGE
========================================================= */

export default async function BlogsPage() {
  const [
    featuredBlog,
    blogs,
    categories,
    tags,
  ] = await Promise.all([
    getFeaturedBlog(),
    getPublishedBlogs(12, 0),
    getAllCategories(),
    getAllTags(),
  ]);

  const latestBlogs = featuredBlog
    ? blogs.filter(
        (blog) => blog.id !== featuredBlog.id
      )
    : blogs;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-white to-red-50/30">

      {/* =====================================================
          HERO SECTION
      ===================================================== */}

      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-red-900 pb-16 pt-12 sm:pt-16">

        {/* Background decoration */}

        <div className="absolute inset-0 opacity-10">

          <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-blue-400 blur-3xl" />

          <div className="absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-red-400 blur-3xl" />

        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">

          {/* Badge */}

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-blue-200 backdrop-blur-sm">

            <BookOpen className="h-3.5 w-3.5" />

            Starlight Academy Blog

          </div>

          {/* Heading */}

          <h1 className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">

            Learn. Prepare.
            <span className="bg-gradient-to-r from-blue-300 to-red-300 bg-clip-text text-transparent">
              {' '}
              Succeed.
            </span>

          </h1>

          {/* Description */}

          <p className="mx-auto max-w-3xl text-sm leading-relaxed text-blue-100 sm:text-base">

            Stay updated with educational information,
            competitive exam preparation strategies, NIOS
            and Open Schooling guidance, study tips, career
            insights and useful learning resources from
            Starlight Academy.

          </p>

          {/* =================================================
              QUICK CATEGORY PILLS
          ================================================= */}

          {categories.length > 0 && (
            <div className="mt-7 flex flex-wrap justify-center gap-2">

              {categories
                .slice(0, 6)
                .map((category) => (
                  <Link
                    key={category.id}
                    href={`/blogs/category/${category.slug}`}
                  >
                    <Badge
                      variant="outline"
                      className="cursor-pointer border-white/20 px-3 py-1 text-xs text-white/80 transition hover:bg-white/10 hover:text-white"
                    >
                      {category.name}
                    </Badge>
                  </Link>
                ))}

            </div>
          )}

        </div>
      </section>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ===================================================
            NO BLOGS
        =================================================== */}

        {blogs.length === 0 ? (

          <div className="my-12 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/30 py-20">

            <BookOpen className="mb-4 h-12 w-12 text-gray-300" />

            <p className="font-medium text-gray-600">
              No articles available yet
            </p>

            <p className="mt-2 text-sm text-gray-400">
              New educational content will be published soon.
            </p>

          </div>

        ) : (

          <>

            {/* =================================================
                FEATURED ARTICLE
            ================================================= */}

            {featuredBlog && (
              <section className="relative z-20 -mt-8 mb-12">

                <BlogCard
                  blog={featuredBlog}
                  variant="featured"
                />

              </section>
            )}

            {/* =================================================
                MAIN CONTENT + SIDEBAR
            ================================================= */}

            <div className="grid grid-cols-1 gap-8 pb-16 lg:grid-cols-[1fr_320px]">

              {/* =================================================
                  ARTICLES
              ================================================= */}

              <div>

                <div className="mb-6 flex items-center gap-2">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>

                  <div>

                    <h2 className="text-xl font-bold text-gray-900">
                      Latest Articles
                    </h2>

                    <p className="text-sm text-gray-500">
                      Latest updates and learning resources
                    </p>

                  </div>

                </div>

                {latestBlogs.length > 0 ? (

                  <div className="grid gap-6 sm:grid-cols-2">

                    {latestBlogs.map((blog) => (
                      <BlogCard
                        key={blog.id}
                        blog={blog}
                      />
                    ))}

                  </div>

                ) : (

                  <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center">

                    <BookOpen className="mx-auto mb-3 h-10 w-10 text-gray-300" />

                    <p className="text-gray-500">
                      More articles coming soon.
                    </p>

                  </div>

                )}

              </div>

              {/* =================================================
                  SIDEBAR
              ================================================= */}

              <BlogSidebar
                categories={categories}
                tags={tags}
                recentBlogs={latestBlogs.slice(0, 5)}
              />

            </div>

          </>

        )}

        {/* =====================================================
            LEARNING AREAS
        ===================================================== */}

        <section className="mb-16">

          <div className="mb-8 text-center">

            <span className="mb-3 inline-block rounded-full bg-blue-100 px-4 py-2 text-xs font-semibold text-blue-700">
              Explore Our Content
            </span>

            <h2 className="text-3xl font-bold text-gray-900">
              What You'll Find Here
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-gray-600">
              Useful information and learning resources
              covering the areas students are most interested
              in.
            </p>

          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">

            {/* Competitive Exams */}

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">

              <div className="mb-4 inline-flex rounded-xl bg-blue-100 p-3 text-blue-700">
                <GraduationCap className="h-6 w-6" />
              </div>

              <h3 className="mb-2 font-bold text-gray-900">
                Competitive Exams
              </h3>

              <p className="text-sm leading-relaxed text-gray-600">
                Exam updates, preparation strategies,
                study plans and useful guidance for
                competitive examinations.
              </p>

            </div>

            {/* NIOS */}

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">

              <div className="mb-4 inline-flex rounded-xl bg-green-100 p-3 text-green-700">
                <BookOpen className="h-6 w-6" />
              </div>

              <h3 className="mb-2 font-bold text-gray-900">
                NIOS & Open Schooling
              </h3>

              <p className="text-sm leading-relaxed text-gray-600">
                NIOS information, admission guidance,
                examination updates, subjects and
                Open Schooling resources.
              </p>

            </div>

            {/* Academic */}

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">

              <div className="mb-4 inline-flex rounded-xl bg-purple-100 p-3 text-purple-700">
                <FileText className="h-6 w-6" />
              </div>

              <h3 className="mb-2 font-bold text-gray-900">
                Study & Academics
              </h3>

              <p className="text-sm leading-relaxed text-gray-600">
                Study techniques, academic guidance,
                learning strategies and useful resources
                for students.
              </p>

            </div>

            {/* Computer */}

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">

              <div className="mb-4 inline-flex rounded-xl bg-orange-100 p-3 text-orange-700">
                <Laptop className="h-6 w-6" />
              </div>

              <h3 className="mb-2 font-bold text-gray-900">
                Computer Education
              </h3>

              <p className="text-sm leading-relaxed text-gray-600">
                Computer learning resources, digital skills,
                software guidance and technology-related
                educational content.
              </p>

            </div>

          </div>

        </section>

        {/* =====================================================
            NEWSLETTER
        ===================================================== */}

        <BlogNewsletter />

        {/* =====================================================
            CTA
        ===================================================== */}

        <div className="mb-16 mt-12">
          <BlogCTA />
        </div>

      </main>

      {/* =====================================================
          JSON-LD BLOG SCHEMA
      ===================================================== */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Blog',

            name: 'Starlight Academy Blog',

            description:
              'Educational updates, competitive exam preparation strategies, NIOS and Open Schooling guidance, study tips and learning resources from Starlight Academy.',

            url: '/blogs',

            publisher: {
              '@type': 'Organization',

              name: 'Starlight Academy',
            },

            inLanguage: 'en-IN',
          }),
        }}
      />

    </div>
  );
}