/*
# Add category column to courses table

1. Modified Tables
   - `courses`: Added `category` column (text, nullable) to store the course category
     (government_exams, nios, open_schooling, computer_courses).
2. Security
   - No RLS policy changes needed. The existing policies on `courses` already
     allow authenticated users to insert/update and the public to read.
3. Notes
   - The admin page was sending `category` in the insert payload but the column
     did not exist, causing a "Could not find the `category` column" error.
   - This migration adds the missing column so course creation/editing works.
*/

ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS category text;
