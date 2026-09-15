import { createServerClient } from '@/lib/supabase/server';
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerClient();

  const { data: blogs } = await supabase
    .from('blogs')
    .select('slug, updated_at')
    .eq('published', true)
    .order('created_at', { ascending: false });

  const { data: categories } = await supabase
    .from('categories')
    .select('slug, created_at');

  const { data: tags } = await supabase
    .from('tags')
    .select('slug, created_at');

  const baseUrl = 'https://vihaaneducation.com';

  const blogEntries = (blogs || []).map(blog => ({
    url: `${baseUrl}/blogs/${blog.slug}`,
    lastModified: new Date(blog.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const categoryEntries = (categories || []).map(cat => ({
    url: `${baseUrl}/blogs/category/${cat.slug}`,
    lastModified: new Date(cat.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const tagEntries = (tags || []).map(tag => ({
    url: `${baseUrl}/blogs/tag/${tag.slug}`,
    lastModified: new Date(tag.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/admission`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    ...blogEntries,
    ...categoryEntries,
    ...tagEntries,
  ];
}
