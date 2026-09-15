/*
  # Create Students Table

  This migration sets up the students table for student information management.

  1. New Tables
    - `students`
      - `id` (uuid, primary key) - Unique identifier
      - `name` (text) - Student name
      - `email` (text, unique) - Student email address
      - `enrollment_number` (text, unique) - Student enrollment number
      - `course` (text) - Course enrolled in
      - `phone` (text) - Contact phone number
      - `class` (text) - Class/section
      - `reference_number` (text) - Reference number for tracking
      - `subjects` (text[]) - Array of subjects
      - `created_at` (timestamp) - Record creation time
      - `updated_at` (timestamp) - Last update time

  2. Security
    - Enable RLS on `students` table
    - Authenticated users can read and manage students

  3. Important Notes
    - Email and enrollment_number must be unique
    - Subjects stored as text array
*/

CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  enrollment_number text UNIQUE NOT NULL DEFAULT '',
  course text DEFAULT '',
  phone text DEFAULT '',
  class text DEFAULT '',
  reference_number text DEFAULT '',
  subjects text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Policies for students table
CREATE POLICY "Authenticated users can view students"
  ON students FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create students"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update students"
  ON students FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete students"
  ON students FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS students_email_idx ON students(email);
CREATE INDEX IF NOT EXISTS students_enrollment_number_idx ON students(enrollment_number);
CREATE INDEX IF NOT EXISTS students_created_at_idx ON students(created_at DESC);
CREATE INDEX IF NOT EXISTS students_course_idx ON students(course);

-- Trigger for updated_at
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();