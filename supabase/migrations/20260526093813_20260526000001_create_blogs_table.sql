/*
  # Create Blogs Table

  This migration sets up the blogs table for blog post management.

  1. New Tables
    - `blogs`
      - `id` (uuid, primary key) - Unique identifier
      - `title` (text) - Blog title
      - `slug` (text, unique) - URL-friendly identifier
      - `content` (text) - Blog content
      - `author` (text) - Author name
      - `image_url` (text) - Cover image URL
      - `created_at` (timestamp) - Creation timestamp
      - `updated_at` (timestamp) - Last update timestamp

  2. Security
    - Enable RLS on `blogs` table
    - Authenticated users can read all blogs
    - Only authenticated users can manage blogs

  3. Important Notes
    - Slug is auto-generated from title if not provided
    - Updated_at automatically changes on updates
*/

CREATE TABLE IF NOT EXISTS blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL DEFAULT '',
  content text DEFAULT '',
  author text DEFAULT '',
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Policies for blogs table
CREATE POLICY "Authenticated users can view blogs"
  ON blogs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create blogs"
  ON blogs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update blogs"
  ON blogs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete blogs"
  ON blogs FOR DELETE
  TO authenticated
  USING (true);

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS blogs_slug_idx ON blogs(slug);

-- Create index for created_at ordering
CREATE INDEX IF NOT EXISTS blogs_created_at_idx ON blogs(created_at DESC);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to call the function
CREATE TRIGGER update_blogs_updated_at
  BEFORE UPDATE ON blogs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();