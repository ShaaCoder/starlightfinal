import { createServerClient } from '@/lib/supabase/server';
import type { Blog, BlogCategory, BlogTag, BlogFAQ } from '@/lib/types';
import { blogs as fallbackBlogs } from '@/lib/data/blogs';

export async function getPublishedBlogs(limit = 12, offset = 0) {
  const supabase = createServerClient();
  try {
    const { data, error } = await supabase
      .from('blogs')
      .select(`
        *,
        blog_categories(categories(*)),
        blog_tags(tags(*))
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (!error && data && data.length > 0) {
      return (data || []).map(formatBlog);
    }
  } catch (e) {
    // Fall through to use fallback data
  }
  
  // Use fallback data
  return fallbackBlogs.slice(offset, offset + limit);
}

export async function getFeaturedBlog() {
  const supabase = createServerClient();
  try {
    const { data } = await supabase
      .from('blogs')
      .select(`
        *,
        blog_categories(categories(*)),
        blog_tags(tags(*))
      `)
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      return formatBlog(data);
    }
  } catch (e) {
    // Fall through
  }
  
  // Use fallback featured blog
  return fallbackBlogs.find(b => b.featured) || fallbackBlogs[0] || null;
}

export async function getBlogBySlug(slug: string) {
  const supabase = createServerClient();

  console.log("Searching slug:", slug);

  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", slug)
    .single();

  console.log("Blog data:", data);
  console.log("Blog error:", error);

  return data;
}

export async function getRelatedBlogs(blogId: string, limit = 3) {
  const supabase = createServerClient();
  try {
    const { data: catData } = await supabase
      .from('blog_categories')
      .select('category_id')
      .eq('blog_id', blogId);

    const categoryIds = (catData || []).map(c => c.category_id);

    if (categoryIds.length === 0) {
      const { data } = await supabase
        .from('blogs')
        .select(`
          *,
          blog_categories(categories(*)),
          blog_tags(tags(*))
        `)
        .neq('id', blogId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (data && data.length > 0) {
        return (data || []).map(formatBlog);
      }
    } else {
      const { data: relatedIds } = await supabase
        .from('blog_categories')
        .select('blog_id')
        .in('category_id', categoryIds)
        .neq('blog_id', blogId);

      const ids = Array.from(new Set((relatedIds || []).map(r => r.blog_id))).slice(0, limit);

      if (ids.length > 0) {
        const { data } = await supabase
          .from('blogs')
          .select(`
            *,
            blog_categories(categories(*)),
            blog_tags(tags(*))
          `)
          .in('id', ids)
          .limit(limit);

        if (data && data.length > 0) {
          return (data || []).map(formatBlog);
        }
      }
    }
  } catch (e) {
    // Fall through
  }
  
  // Use fallback related blogs (exclude current blog)
  return fallbackBlogs.filter(b => b.id !== blogId).slice(0, limit);
}

export async function getBlogsByCategory(categorySlug: string, limit = 12, offset = 0) {
  const supabase = createServerClient();

  const { data: category } = await supabase
    .from('categories')
    .select('id, name, slug, description')
    .eq('slug', categorySlug)
    .maybeSingle();

  if (!category) return { blogs: [], category: null };

  const { data: blogIds } = await supabase
    .from('blog_categories')
    .select('blog_id')
    .eq('category_id', category.id);

  const ids = (blogIds || []).map(b => b.blog_id);

  if (ids.length === 0) return { blogs: [], category };

  const { data } = await supabase
    .from('blogs')
    .select(`
      *,
      blog_categories(categories(*)),
      blog_tags(tags(*))
    `)
    .in('id', ids)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  return { blogs: (data || []).map(formatBlog), category };
}

export async function getBlogsByTag(tagSlug: string, limit = 12, offset = 0) {
  const supabase = createServerClient();

  const { data: tag } = await supabase
    .from('tags')
    .select('id, name, slug')
    .eq('slug', tagSlug)
    .maybeSingle();

  if (!tag) return { blogs: [], tag: null };

  const { data: blogIds } = await supabase
    .from('blog_tags')
    .select('blog_id')
    .eq('tag_id', tag.id);

  const ids = (blogIds || []).map(b => b.blog_id);

  if (ids.length === 0) return { blogs: [], tag };

  const { data } = await supabase
    .from('blogs')
    .select(`
      *,
      blog_categories(categories(*)),
      blog_tags(tags(*))
    `)
    .in('id', ids)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  return { blogs: (data || []).map(formatBlog), tag };
}

export async function getAllCategories() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });
  return (data || []) as BlogCategory[];
}

export async function getAllTags() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('tags')
    .select('*')
    .order('name', { ascending: true });
  return (data || []) as BlogTag[];
}

export async function searchBlogs(query: string, limit = 12) {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('blogs')
    .select(`
      *,
      blog_categories(categories(*)),
      blog_tags(tags(*))
    `)
    .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,focus_keyword.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(limit);

  return (data || []).map(formatBlog);
}

export async function getBlogCount() {
  const supabase = createServerClient();
  const { count } = await supabase
    .from('blogs')
    .select('*', { count: 'exact', head: true });
  return count || 0;
}

function formatBlog(raw: Record<string, unknown>): Blog {
  const categories = (raw.blog_categories as Array<{ categories: BlogCategory }>)?.map(c => c.categories).filter(Boolean) || [];
  const tags = (raw.blog_tags as Array<{ tags: BlogTag }>)?.map(t => t.tags).filter(Boolean) || [];
  const faqs = (raw.faqs as BlogFAQ[]) || [];

  return {
    id: raw.id as string,
    title: raw.title as string,
    slug: raw.slug as string,
    content: raw.content as string,
    excerpt: raw.excerpt as string,
    featured_image: raw.featured_image as string,
    image_alt: raw.image_alt as string,
    author: raw.author as string,
    meta_title: raw.meta_title as string,
    meta_description: raw.meta_description as string,
    focus_keyword: raw.focus_keyword as string,
    canonical_url: raw.canonical_url as string,
    og_image: raw.og_image as string,
    reading_time: raw.reading_time as number,
    views: raw.views as number,
    featured: raw.featured as boolean,
    published: raw.published as boolean,
    created_at: raw.created_at as string,
    updated_at: raw.updated_at as string,
    categories,
    tags,
    faqs,
  };
}

export function calculateReadingTime(content: string): number {
  if (!content) return 1;
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^-|-$/g, '');
}

export function calculateSEOScore(blog: Partial<Blog>): { score: number; checks: {
    keyword_in_title: boolean;
    keyword_in_description: boolean;
    slug_optimized: boolean;
    heading_structure: boolean;
    image_alt_present: boolean;
    content_length_ok: boolean;
    faq_present: boolean;
    meta_title_length: boolean;
    meta_description_length: boolean;
    excerpt_present: boolean;
  } } {
  const checks = {
    keyword_in_title: !!(blog.focus_keyword && blog.title?.toLowerCase().includes(blog.focus_keyword.toLowerCase())),
    keyword_in_description: !!(blog.focus_keyword && blog.meta_description?.toLowerCase().includes(blog.focus_keyword.toLowerCase())),
    slug_optimized: !!(blog.slug && blog.slug.length > 0 && blog.slug === blog.title?.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')),
    heading_structure: !!(blog.content && /<h[12]/i.test(blog.content)),
    image_alt_present: !!(blog.image_alt && blog.image_alt.length > 0),
    content_length_ok: !!(blog.content && blog.content.length >= 300),
    faq_present: !!(blog.faqs && blog.faqs.length > 0),
    meta_title_length: !!(blog.meta_title && blog.meta_title.length >= 30 && blog.meta_title.length <= 60),
    meta_description_length: !!(blog.meta_description && blog.meta_description.length >= 120 && blog.meta_description.length <= 160),
    excerpt_present: !!(blog.excerpt && blog.excerpt.length > 0),
  };

  const passed = Object.values(checks).filter(Boolean).length;
  const score = Math.round((passed / Object.values(checks).length) * 100);

  return { score, checks };
}
