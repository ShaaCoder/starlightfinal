/*
  # Fix RLS Policies to Allow Public Access

  1. Purpose
    - Add public SELECT policies for courses, blogs, and notices
    - Allow unauthenticated users to view content on the frontend
    - Maintain authenticated-only write/delete permissions

  2. Changes
    - Add policy for public to view all courses
    - Add policy for public to view all blogs (removed published filter from app code)
    - Add policy for public to view active notices only
*/

-- Allow public (anon) users to view courses
CREATE POLICY "Public can view courses"
  ON courses
  FOR SELECT
  TO anon
  USING (true);

-- Allow public (anon) users to view all blogs
CREATE POLICY "Public can view all blogs"
  ON blogs
  FOR SELECT
  TO anon
  USING (true);

-- Allow public (anon) users to view active notices
CREATE POLICY "Public can view active notices"
  ON notices
  FOR SELECT
  TO anon
  USING (is_active = true);
