/*
  # Add slug column to blogs table

  1. New Columns
    - `slug` (text, unique, not null) - SEO-friendly URL identifier for blog posts

  2. Changes
    - Adds a slug column to the blogs table
    - Creates a unique index on the slug column for fast lookups
    - Backfills existing rows with generated slugs from their titles

  3. Security
    - No RLS changes needed; column is accessible under existing policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blogs' AND column_name = 'slug'
  ) THEN
    ALTER TABLE blogs ADD COLUMN slug text;
  END IF;
END $$;

-- Backfill slugs for existing rows
UPDATE blogs
SET slug = lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;

-- Now make it NOT NULL and UNIQUE
ALTER TABLE blogs ALTER COLUMN slug SET NOT NULL;
ALTER TABLE blogs ADD CONSTRAINT blogs_slug_unique UNIQUE (slug);

-- Index for fast slug lookups
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs (slug);
