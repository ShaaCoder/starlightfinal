/*
  # Create Courses Table

  This migration sets up the courses table for managing course information.

  1. New Tables
    - `courses`
      - `id` (uuid, primary key) - Unique identifier for each course
      - `title` (text) - Course title
      - `description` (text) - Course description
      - `image_url` (text) - URL for course image
      - `created_at` (timestamp) - Record creation time

  2. Security
    - Enable RLS on `courses` table
    - Allow authenticated users to read all courses
    - Only authenticated users can insert/update/delete courses
*/

CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Policies for courses table
CREATE POLICY "Authenticated users can view courses"
  ON courses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create courses"
  ON courses FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update courses"
  ON courses FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete courses"
  ON courses FOR DELETE
  TO authenticated
  USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS courses_created_at_idx ON courses(created_at DESC);