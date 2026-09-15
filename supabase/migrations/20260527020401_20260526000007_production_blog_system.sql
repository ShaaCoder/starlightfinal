/*
  # Production Blog System - Complete Schema

  Replaces the basic `blogs` table with a full relational blog system
  optimized for SEO, content management, and multi-category/tag organization.

  1. Changes
    - Drop existing `blogs` table (was empty/basic)
    - Create new `categories` table with hierarchical support (parent_id)
    - Create new `tags` table
    - Create new `blogs` table with full SEO fields
    - Create `blog_categories` junction table (many-to-many)
    - Create `blog_tags` junction table (many-to-many)
    - Create `blog_faqs` table for FAQ sections within blog posts

  2. New Tables
    - `categories`: name, slug, description, parent_id (self-referencing)
    - `tags`: name, slug
    - `blogs`: title, slug, content, excerpt, featured_image, image_alt,
               author, meta_title, meta_description, focus_keyword,
               canonical_url, og_image, reading_time, views, featured,
               published, created_at, updated_at
    - `blog_categories`: blog_id, category_id
    - `blog_tags`: blog_id, tag_id
    - `blog_faqs`: blog_id, question, answer, sort_order

  3. Security
    - RLS enabled on all tables
    - Authenticated users can read/write all blog data
    - Public read access for published blogs (for SEO crawling)

  4. Indexes
    - slug indexes on blogs, categories, tags
    - published index on blogs
    - created_at index on blogs
    - category/tag indexes on junction tables

  5. Important Notes
    - blog_faqs supports FAQ schema generation per article
    - categories support hierarchy via parent_id
    - blogs.published boolean enables draft/publish workflow
    - blogs.views counter for tracking readership
    - blogs.featured boolean for homepage hero selection
*/

-- Drop old blogs table if exists
DROP TABLE IF EXISTS blogs CASCADE;

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Blogs table with full SEO support
CREATE TABLE IF NOT EXISTS blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL DEFAULT '',
  content text DEFAULT '',
  excerpt text DEFAULT '',
  featured_image text DEFAULT '',
  image_alt text DEFAULT '',
  author text DEFAULT '',
  meta_title text DEFAULT '',
  meta_description text DEFAULT '',
  focus_keyword text DEFAULT '',
  canonical_url text DEFAULT '',
  og_image text DEFAULT '',
  reading_time integer DEFAULT 0,
  views integer DEFAULT 0,
  featured boolean DEFAULT false,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Blog-Categories junction table
CREATE TABLE IF NOT EXISTS blog_categories (
  blog_id uuid REFERENCES blogs(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (blog_id, category_id)
);

-- Blog-Tags junction table
CREATE TABLE IF NOT EXISTS blog_tags (
  blog_id uuid REFERENCES blogs(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (blog_id, tag_id)
);

-- Blog FAQs table
CREATE TABLE IF NOT EXISTS blog_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id uuid REFERENCES blogs(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text DEFAULT '',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_faqs ENABLE ROW LEVEL SECURITY;

-- Policies for categories
CREATE POLICY "Public can view categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated can manage categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (true);

-- Policies for tags
CREATE POLICY "Public can view tags"
  ON tags FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated can manage tags"
  ON tags FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update tags"
  ON tags FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete tags"
  ON tags FOR DELETE
  TO authenticated
  USING (true);

-- Policies for blogs
CREATE POLICY "Public can view published blogs"
  ON blogs FOR SELECT
  TO anon, authenticated
  USING (published = true);

CREATE POLICY "Authenticated can view all blogs"
  ON blogs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can create blogs"
  ON blogs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update blogs"
  ON blogs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete blogs"
  ON blogs FOR DELETE
  TO authenticated
  USING (true);

-- Policies for blog_categories
CREATE POLICY "Public can view blog categories"
  ON blog_categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated can manage blog categories"
  ON blog_categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update blog categories"
  ON blog_categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete blog categories"
  ON blog_categories FOR DELETE
  TO authenticated
  USING (true);

-- Policies for blog_tags
CREATE POLICY "Public can view blog tags"
  ON blog_tags FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated can manage blog tags"
  ON blog_tags FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update blog tags"
  ON blog_tags FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete blog tags"
  ON blog_tags FOR DELETE
  TO authenticated
  USING (true);

-- Policies for blog_faqs
CREATE POLICY "Public can view blog faqs"
  ON blog_faqs FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated can manage blog faqs"
  ON blog_faqs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update blog faqs"
  ON blog_faqs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete blog faqs"
  ON blog_faqs FOR DELETE
  TO authenticated
  USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS blogs_slug_idx ON blogs(slug);
CREATE INDEX IF NOT EXISTS blogs_published_idx ON blogs(published);
CREATE INDEX IF NOT EXISTS blogs_created_at_idx ON blogs(created_at DESC);
CREATE INDEX IF NOT EXISTS blogs_featured_idx ON blogs(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS blogs_author_idx ON blogs(author);
CREATE INDEX IF NOT EXISTS blogs_views_idx ON blogs(views DESC);
CREATE INDEX IF NOT EXISTS categories_slug_idx ON categories(slug);
CREATE INDEX IF NOT EXISTS categories_parent_id_idx ON categories(parent_id);
CREATE INDEX IF NOT EXISTS tags_slug_idx ON tags(slug);
CREATE INDEX IF NOT EXISTS blog_categories_blog_id_idx ON blog_categories(blog_id);
CREATE INDEX IF NOT EXISTS blog_categories_category_id_idx ON blog_categories(category_id);
CREATE INDEX IF NOT EXISTS blog_tags_blog_id_idx ON blog_tags(blog_id);
CREATE INDEX IF NOT EXISTS blog_tags_tag_id_idx ON blog_tags(tag_id);
CREATE INDEX IF NOT EXISTS blog_faqs_blog_id_idx ON blog_faqs(blog_id);

-- Trigger for updated_at
CREATE TRIGGER update_blogs_updated_at
  BEFORE UPDATE ON blogs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();