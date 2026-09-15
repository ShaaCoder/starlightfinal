/*
  # Vihaan Education Academy - Initial Schema

  ## Tables Created
  1. **courses**
     - `id` (uuid, primary key) - Unique course identifier
     - `title` (text, required) - Course title
     - `description` (text, required) - Course description
     - `image_url` (text, optional) - URL to course image in storage
     - `created_at` (timestamptz) - Creation timestamp

  2. **leads**
     - `id` (uuid, primary key) - Unique lead identifier
     - `name` (text, required) - Lead name
     - `phone` (text, required) - Contact phone number
     - `email` (text, optional) - Email address
     - `course` (text, required) - Course interested in
     - `message` (text, optional) - Additional message
     - `created_at` (timestamptz) - Submission timestamp

  ## Security
  - Enable RLS on both tables
  - Courses: Public read access, authenticated write access
  - Leads: Public insert access, authenticated read access
*/

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  course text NOT NULL,
  message text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Courses policies: Everyone can read, only authenticated can write
CREATE POLICY "Anyone can view courses"
  ON courses FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert courses"
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

-- Leads policies: Anyone can insert, only authenticated can read
CREATE POLICY "Anyone can submit leads"
  ON leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view leads"
  ON leads FOR SELECT
  TO authenticated
  USING (true);