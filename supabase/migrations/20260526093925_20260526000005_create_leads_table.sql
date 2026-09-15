/*
  # Create Leads (Contacts) Table

  This migration sets up the leads table for contact form submissions and inquiries.

  1. New Tables
    - `leads`
      - `id` (uuid, primary key) - Unique identifier
      - `name` (text) - Contact name
      - `phone` (text) - Contact phone number
      - `email` (text) - Contact email
      - `course` (text) - Course of interest
      - `message` (text) - Inquiry message
      - `status` (text) - Lead status: 'new', 'contacted', 'converted', 'closed'
      - `created_at` (timestamp) - Submission time

  2. Security
    - Enable RLS on `leads` table
    - Authenticated users can read and manage leads

  3. Important Notes
    - Tracks prospective students making inquiries
    - Status helps track lead lifecycle
*/

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text DEFAULT '',
  email text NOT NULL,
  course text DEFAULT '',
  message text DEFAULT '',
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'closed')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policies for leads table
CREATE POLICY "Authenticated users can view leads"
  ON leads FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create leads"
  ON leads FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update leads"
  ON leads FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete leads"
  ON leads FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS leads_email_idx ON leads(email);
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS leads_course_idx ON leads(course);