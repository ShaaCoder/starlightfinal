'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import type { Blog, BlogCategory, BlogTag, BlogFAQ } from '@/lib/types';
import type { BlogFormData, SEOScore } from '@/types/blog';
import { calculateReadingTime, generateSlug, calculateSEOScore } from '@/lib/blog/queries';
import { BlogEditor } from './blog-editor';
import { BlogSEOScore } from './blog-seo-score';
import { BlogFAQBuilder } from './blog-faq-builder';
import { Plus, Save, Eye, EyeOff, Search, Trash2, CreditCard as Edit3, X, Upload, FileText, Tag, FolderOpen, Star, StarOff, ChevronDown, ArrowLeft, Image as ImageIcon, Settings, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function BlogCMS() {
  const supabase = createClient();

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [view, setView] = useState<'list' | 'editor'>('list');

  // Form state
  const [form, setForm] = useState<BlogFormData>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image: '',
    image_alt: '',
    author: 'Vihaan Academy',
    meta_title: '',
    meta_description: '',
    focus_keyword: '',
    canonical_url: '',
    og_image: '',
    reading_time: 0,
    featured: false,
    published: false,
    category_ids: [],
    tag_ids: [],
    faqs: [],
  });

  const [seoScore, setSeoScore] = useState<SEOScore>({
    score: 0,
    checks: {
      keyword_in_title: false,
      keyword_in_description: false,
      slug_optimized: false,
      heading_structure: false,
      image_alt_present: false,
      content_length_ok: false,
      faq_present: false,
      meta_title_length: false,
      meta_description_length: false,
      excerpt_present: false,
    },
  });
  const [uploading, setUploading] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [blogsRes, catsRes, tagsRes] = await Promise.all([
      (supabase.from('blogs') as any).select(`*, blog_categories(categories(*)), blog_tags(tags(*))`).order('created_at', { ascending: false }),
      (supabase.from('categories') as any).select('*').order('name'),
      (supabase.from('tags') as any).select('*').order('name'),
    ]);

    if (blogsRes.data) {
      setBlogs(blogsRes.data.map((b: Record<string, unknown>) => ({
        id: b.id as string,
        title: b.title as string,
        slug: b.slug as string,
        content: b.content as string,
        excerpt: b.excerpt as string,
        featured_image: b.featured_image as string,
        image_alt: b.image_alt as string,
        author: b.author as string,
        meta_title: b.meta_title as string,
        meta_description: b.meta_description as string,
        focus_keyword: b.focus_keyword as string,
        canonical_url: b.canonical_url as string,
        og_image: b.og_image as string,
        reading_time: b.reading_time as number,
        views: b.views as number,
        featured: b.featured as boolean,
        published: b.published as boolean,
        created_at: b.created_at as string,
        updated_at: b.updated_at as string,
        categories: (b.blog_categories as Array<{ categories: BlogCategory }>)?.map(c => c.categories).filter(Boolean) || [],
        tags: (b.blog_tags as Array<{ tags: BlogTag }>)?.map(t => t.tags).filter(Boolean) || [],
      })));
    }
    if (catsRes.data) setCategories(catsRes.data);
    if (tagsRes.data) setTags(tagsRes.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Calculate SEO score when form changes
  useEffect(() => {
    const result = calculateSEOScore(form as unknown as Partial<Blog>);
    setSeoScore(result);
  }, [form.title, form.meta_title, form.meta_description, form.focus_keyword, form.slug, form.content, form.image_alt, form.excerpt, form.faqs]);

  const handleNewBlog = () => {
    setEditingBlog(null);
    setForm({
      title: '', slug: '', content: '', excerpt: '', featured_image: '', image_alt: '',
      author: 'Vihaan Academy', meta_title: '', meta_description: '', focus_keyword: '',
      canonical_url: '', og_image: '', reading_time: 0, featured: false, published: false,
      category_ids: [], tag_ids: [], faqs: [],
    });
    setView('editor');
  };

  const handleEditBlog = (blog: Blog) => {
    setEditingBlog(blog);
    setForm({
      title: blog.title,
      slug: blog.slug,
      content: blog.content,
      excerpt: blog.excerpt,
      featured_image: blog.featured_image,
      image_alt: blog.image_alt,
      author: blog.author,
      meta_title: blog.meta_title,
      meta_description: blog.meta_description,
      focus_keyword: blog.focus_keyword,
      canonical_url: blog.canonical_url,
      og_image: blog.og_image,
      reading_time: blog.reading_time,
      featured: blog.featured,
      published: blog.published,
      category_ids: blog.categories?.map(c => c.id) || [],
      tag_ids: blog.tags?.map(t => t.id) || [],
      faqs: blog.faqs?.map(f => ({ question: f.question, answer: f.answer, sort_order: f.sort_order })) || [],
    });
    setView('editor');
  };

  const handleTitleChange = (title: string) => {
    const slug = generateSlug(title);
    setForm(prev => ({
      ...prev,
      title,
      slug: prev.slug || slug,
      meta_title: prev.meta_title || title,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `uploads/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from('blogs').upload(path, file);
    if (error) {
      toast.error('Image upload failed');
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from('blogs').getPublicUrl(path);
    setForm(prev => ({
      ...prev,
      featured_image: urlData.publicUrl,
      og_image: prev.og_image || urlData.publicUrl,
    }));
    setUploading(false);
    toast.success('Image uploaded');
  };

  const handleSave = async () => {
    const readingTime = calculateReadingTime(form.content);

    // Sanitize slug (extract last segment if full URL or path is pasted)
    const sanitizeSlug = (input: string): string => {
      if (!input) return '';
      let cleaned = input.trim();
      if (cleaned.includes('/')) {
        const segments = cleaned.split('/').filter(Boolean);
        cleaned = segments[segments.length - 1] || '';
      }
      return generateSlug(cleaned);
    };

    const cleanSlug = form.slug ? sanitizeSlug(form.slug) : generateSlug(form.title);

    const blogData = {
      title: form.title,
      slug: cleanSlug,
      content: form.content,
      excerpt: form.excerpt,
      featured_image: form.featured_image,
      image_alt: form.image_alt,
      author: form.author,
      meta_title: form.meta_title || form.title,
      meta_description: form.meta_description || form.excerpt,
      focus_keyword: form.focus_keyword,
      canonical_url: form.canonical_url,
      og_image: form.og_image || form.featured_image,
      reading_time: readingTime,
      featured: form.featured,
      published: form.published,
    };

    let blogId: string;

    if (editingBlog) {
      const { error } = await (supabase.from('blogs') as any).update(blogData).eq('id', editingBlog.id);
      if (error) { toast.error('Failed to update blog'); return; }
      blogId = editingBlog.id;
      toast.success('Blog updated successfully');
    } else {
      const { data, error } = await (supabase.from('blogs') as any).insert(blogData).select('id').single();
      if (error) { toast.error('Failed to create blog'); return; }
      blogId = data.id;
      toast.success('Blog created successfully');
    }

    // Update categories
    await (supabase.from('blog_categories') as any).delete().eq('blog_id', blogId);
    if (form.category_ids.length > 0) {
      await (supabase.from('blog_categories') as any).insert(form.category_ids.map(cid => ({ blog_id: blogId, category_id: cid })));
    }

    // Update tags
    await (supabase.from('blog_tags') as any).delete().eq('blog_id', blogId);
    if (form.tag_ids.length > 0) {
      await (supabase.from('blog_tags') as any).insert(form.tag_ids.map(tid => ({ blog_id: blogId, tag_id: tid })));
    }

    // Update FAQs
    await (supabase.from('blog_faqs') as any).delete().eq('blog_id', blogId);
    if (form.faqs.length > 0) {
      await (supabase.from('blog_faqs') as any).insert(
        form.faqs.map((faq, i) => ({ blog_id: blogId, question: faq.question, answer: faq.answer, sort_order: i }))
      );
    }

    setView('list');
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;
    const { error } = await (supabase.from('blogs') as any).delete().eq('id', id);
    if (error) { toast.error('Failed to delete'); return; }
    toast.success('Blog deleted');
    fetchData();
  };

  const handleTogglePublished = async (blog: Blog) => {
    const { error } = await (supabase.from('blogs') as any).update({ published: !blog.published }).eq('id', blog.id);
    if (error) { toast.error('Failed to update'); return; }
    toast.success(blog.published ? 'Unpublished' : 'Published');
    fetchData();
  };

  const handleToggleFeatured = async (blog: Blog) => {
    const { error } = await (supabase.from('blogs') as any).update({ featured: !blog.featured }).eq('id', blog.id);
    if (error) { toast.error('Failed to update'); return; }
    toast.success(blog.featured ? 'Unfeatured' : 'Featured');
    fetchData();
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    const slug = generateSlug(newCategoryName);
    const { error } = await (supabase.from('categories') as any).insert({ name: newCategoryName, slug, description: newCategoryDesc });
    if (error) { toast.error('Failed to create category'); return; }
    toast.success('Category created');
    setNewCategoryName('');
    setNewCategoryDesc('');
    setShowCategoryDialog(false);
    fetchData();
  };

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    const slug = generateSlug(newTagName);
    const { error } = await (supabase.from('tags') as any).insert({ name: newTagName, slug });
    if (error) { toast.error('Failed to create tag'); return; }
    toast.success('Tag created');
    setNewTagName('');
    setShowTagDialog(false);
    fetchData();
  };

  const toggleCategory = (id: string) => {
    setForm(prev => ({
      ...prev,
      category_ids: prev.category_ids.includes(id)
        ? prev.category_ids.filter(c => c !== id)
        : [...prev.category_ids, id],
    }));
  };

  const toggleTag = (id: string) => {
    setForm(prev => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(id)
        ? prev.tag_ids.filter(t => t !== id)
        : [...prev.tag_ids, id],
    }));
  };

  const filteredBlogs = blogs.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'published' && b.published) ||
      (filterStatus === 'draft' && !b.published);
    return matchesSearch && matchesFilter;
  });

  // LIST VIEW
  if (view === 'list') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-slate-900">Blog Posts</h2>
            <p className="text-sm text-slate-500 mt-1">{blogs.length} total posts</p>
          </div>
          <Button onClick={handleNewBlog} className="w-full gap-2 bg-sky-600 text-white hover:bg-sky-700 sm:w-auto">
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative w-full flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts..."
              className="pl-10 border-slate-200"
            />
          </div>
          <div className="flex w-full gap-2 overflow-x-auto sm:w-auto">
            {(['all', 'published', 'draft'] as const).map(status => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus(status)}
                className={filterStatus === status ? 'bg-sky-600 text-white' : 'border-slate-200 text-slate-600'}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Blog List */}
        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-200 rounded-xl">
            <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No blog posts found</p>
            <p className="text-sm text-slate-400 mt-1">Create your first blog post to get started</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredBlogs.map(blog => (
            <div
  key={blog.id}
  className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
>
  <div className="flex gap-3">
    {/* Thumbnail */}
    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
      {blog.featured_image ? (
        <img
          src={blog.featured_image}
          alt={blog.title}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <FileText className="h-5 w-5 text-slate-300" />
        </div>
      )}
    </div>

    {/* Content */}
    <div className="min-w-0 flex-1">
      <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">
        {blog.title}
      </h3>

      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span>{blog.author}</span>
        <span>
          {new Date(blog.created_at).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
        <span>{blog.reading_time || 0} min</span>
      </div>

      <div className="mt-2">
        <Badge
          variant={blog.published ? 'default' : 'secondary'}
          className={
            blog.published
              ? 'bg-green-100 text-green-700'
              : 'bg-slate-100 text-slate-600'
          }
        >
          {blog.published ? 'Published' : 'Draft'}
        </Badge>
      </div>
    </div>
  </div>

  {/* Actions */}
  <div className="mt-3 flex justify-end gap-2 border-t pt-3">
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleToggleFeatured(blog)}
    >
      {blog.featured ? (
        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
      ) : (
        <StarOff className="h-4 w-4" />
      )}
    </Button>

    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleTogglePublished(blog)}
    >
      {blog.published ? (
        <Eye className="h-4 w-4 text-green-600" />
      ) : (
        <EyeOff className="h-4 w-4" />
      )}
    </Button>

    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleEditBlog(blog)}
    >
      <Edit3 className="h-4 w-4" />
    </Button>

    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleDelete(blog.id)}
      className="text-red-600"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  </div>
</div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // EDITOR VIEW
  return (
    <div className="space-y-6">
      {/* Editor Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setView('list')} className="gap-1.5 text-slate-600">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h2 className="text-xl font-bold text-slate-900">
            {editingBlog ? 'Edit Post' : 'New Post'}
          </h2>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Switch
              checked={form.published}
              onCheckedChange={(checked) => setForm(prev => ({ ...prev, published: checked }))}
            />
            <Label className="text-sm text-slate-600">{form.published ? 'Published' : 'Draft'}</Label>
          </div>
          <Button onClick={handleSave} className="w-full gap-2 bg-sky-600 text-white hover:bg-sky-700 sm:w-auto">
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Left Column - Editor */}
        <div className="space-y-6">
          <Tabs defaultValue="content" className="min-w-0">
            <TabsList className="flex h-auto w-full justify-start gap-1 overflow-x-auto bg-slate-100 p-1">
              <TabsTrigger value="content" className="shrink-0">Content</TabsTrigger>
              <TabsTrigger value="seo" className="shrink-0">SEO</TabsTrigger>
              <TabsTrigger value="faq" className="shrink-0">FAQ</TabsTrigger>
            </TabsList>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-5 mt-4">
              {/* Title */}
              <div>
                <Input
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter article title..."
                  className="text-xl font-bold border-slate-200 h-14"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">URL Slug</label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <span className="text-xs text-slate-400">/blogs/</span>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="article-slug"
                    className="text-sm border-slate-200 h-9 flex-1"
                  />
                </div>
              </div>

              {/* Featured Image */}
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Featured Image</label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  {form.featured_image && (
                    <div className="relative h-36 w-full shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:h-20 sm:w-28">
                      <img src={form.featured_image} alt="" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="w-full flex-1">
                    <label className="cursor-pointer">
                      <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 hover:border-sky-400 hover:text-sky-600 transition-colors">
                        <Upload className="h-4 w-4" />
                        {uploading ? 'Uploading...' : 'Upload Image'}
                      </div>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                    <Input
                      value={form.featured_image}
                      onChange={(e) => setForm(prev => ({ ...prev, featured_image: e.target.value }))}
                      placeholder="Or enter image URL"
                      className="mt-2 text-xs border-slate-200 h-8"
                    />
                  </div>
                </div>
                <Input
                  value={form.image_alt}
                  onChange={(e) => setForm(prev => ({ ...prev, image_alt: e.target.value }))}
                  placeholder="Image alt text (for SEO accessibility)"
                  className="mt-2 text-sm border-slate-200 h-9"
                />
              </div>

              {/* Excerpt */}
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Excerpt</label>
                <Textarea
                  value={form.excerpt}
                  onChange={(e) => setForm(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief summary of the article (appears in cards and meta descriptions)..."
                  rows={3}
                  className="text-sm border-slate-200 resize-none"
                />
              </div>

              {/* Content Editor */}
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Article Content</label>
                <BlogEditor
                  content={form.content}
                  onChange={(content) => setForm(prev => ({ ...prev, content }))}
                />
              </div>

              {/* Author */}
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Author</label>
                <Input
                  value={form.author}
                  onChange={(e) => setForm(prev => ({ ...prev, author: e.target.value }))}
                  className="text-sm border-slate-200 h-9"
                />
              </div>
            </TabsContent>

            {/* SEO Tab */}
            <TabsContent value="seo" className="space-y-5 mt-4">
              <div className="grid gap-5">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Focus Keyword</label>
                  <Input
                    value={form.focus_keyword}
                    onChange={(e) => setForm(prev => ({ ...prev, focus_keyword: e.target.value }))}
                    placeholder="Primary keyword for this article"
                    className="text-sm border-slate-200 h-9"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Meta Title ({form.meta_title.length}/60)</label>
                  <Input
                    value={form.meta_title}
                    onChange={(e) => setForm(prev => ({ ...prev, meta_title: e.target.value }))}
                    placeholder="SEO title (30-60 characters recommended)"
                    maxLength={60}
                    className={`text-sm border-slate-200 h-9 ${form.meta_title.length > 60 ? 'border-red-300' : ''}`}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Meta Description ({form.meta_description.length}/160)</label>
                  <Textarea
                    value={form.meta_description}
                    onChange={(e) => setForm(prev => ({ ...prev, meta_description: e.target.value }))}
                    placeholder="SEO description (120-160 characters recommended)"
                    maxLength={160}
                    rows={3}
                    className={`text-sm border-slate-200 resize-none ${form.meta_description.length > 160 ? 'border-red-300' : ''}`}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Canonical URL</label>
                  <Input
                    value={form.canonical_url}
                    onChange={(e) => setForm(prev => ({ ...prev, canonical_url: e.target.value }))}
                    placeholder="Leave empty for default canonical URL"
                    className="text-sm border-slate-200 h-9"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">OG Image Override</label>
                  <Input
                    value={form.og_image}
                    onChange={(e) => setForm(prev => ({ ...prev, og_image: e.target.value }))}
                    placeholder="Leave empty to use featured image"
                    className="text-sm border-slate-200 h-9"
                  />
                </div>
              </div>
            </TabsContent>

            {/* FAQ Tab */}
            <TabsContent value="faq" className="mt-4">
              <BlogFAQBuilder
                faqs={form.faqs}
                onChange={(faqs) => setForm(prev => ({ ...prev, faqs }))}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-5">
          {/* SEO Score */}
          <BlogSEOScore seoScore={seoScore} />

          {/* Categories */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-slate-500" />
                Categories
              </h3>
              <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-slate-500">
                    <Plus className="h-3 w-3" />
                    New
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Category</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 pt-2">
                    <Input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Category name"
                    />
                    <Textarea
                      value={newCategoryDesc}
                      onChange={(e) => setNewCategoryDesc(e.target.value)}
                      placeholder="Description (optional)"
                      rows={2}
                    />
                    <Button onClick={handleAddCategory} className="bg-sky-600 hover:bg-sky-700 text-white w-full">
                      Create Category
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {categories.map(cat => (
                <label key={cat.id} className="flex items-center gap-2.5 py-1.5 px-2 rounded-md hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.category_ids.includes(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                    className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span className="text-sm text-slate-700">{cat.name}</span>
                </label>
              ))}
              {categories.length === 0 && (
                <p className="text-xs text-slate-400 py-2">No categories yet</p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Tag className="h-4 w-4 text-slate-500" />
                Tags
              </h3>
              <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-slate-500">
                    <Plus className="h-3 w-3" />
                    New
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Tag</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 pt-2">
                    <Input
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="Tag name"
                    />
                    <Button onClick={handleAddTag} className="bg-sky-600 hover:bg-sky-700 text-white w-full">
                      Create Tag
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
              {tags.map(tag => (
                <Badge
                  key={tag.id}
                  variant={form.tag_ids.includes(tag.id) ? 'default' : 'outline'}
                  className={`cursor-pointer text-xs ${
                    form.tag_ids.includes(tag.id)
                      ? 'bg-sky-600 text-white hover:bg-sky-700'
                      : 'text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                </Badge>
              ))}
              {tags.length === 0 && (
                <p className="text-xs text-slate-400 py-1">No tags yet</p>
              )}
            </div>
          </div>

          {/* Featured Toggle */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium text-slate-700">Featured Post</span>
              </div>
              <Switch
                checked={form.featured}
                onCheckedChange={(checked) => setForm(prev => ({ ...prev, featured: checked }))}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">Featured posts appear in the hero section of the blog homepage</p>
          </div>
        </div>
      </div>
    </div>
  );
}
